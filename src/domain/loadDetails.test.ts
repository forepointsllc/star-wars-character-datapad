import { describe, expect, it, vi } from "vitest"
import { createResourceCache } from "../api/cache.ts"
import type { SwapiClient } from "../api/client.ts"
import type { Person, Planet, Species, Starship } from "../api/types.ts"
import { loadCharacterSections } from "./loadDetails.ts"

const human = {
  name: "Human",
  classification: "mammal",
  designation: "sentient",
  average_height: "180",
  average_lifespan: "120",
  language: "Galactic Basic",
  url: "https://swapi.info/api/species/1",
} as Species

const tatooine = {
  name: "Tatooine",
  population: "200000",
  terrain: "desert",
  climate: "arid",
  surface_water: "1",
  diameter: "10465",
  rotation_period: "23",
  orbital_period: "304",
  gravity: "1 standard",
  url: "https://swapi.info/api/planets/1",
} as Planet

const xwing = {
  name: "X-wing",
  model: "T-65 X-wing",
  manufacturer: "Incom Corporation",
  starship_class: "Starfighter",
  crew: "1",
  passengers: "0",
  url: "https://swapi.info/api/starships/12",
} as Starship

function luke(overrides: Partial<Person> = {}): Person {
  return {
    name: "Luke Skywalker",
    height: "172",
    mass: "77",
    hair_color: "blond",
    skin_color: "fair",
    eye_color: "blue",
    birth_year: "19BBY",
    gender: "male",
    homeworld: tatooine.url,
    films: [],
    species: [],
    vehicles: [],
    starships: [],
    url: "https://swapi.info/api/people/1",
    ...overrides,
  }
}

describe("loadCharacterSections", () => {
  it("loads related records in parallel and keeps a failed section local", async () => {
    let releaseSpecies: (value: Species) => void = () => {}
    const speciesGate = new Promise<Species>((resolve) => {
      releaseSpecies = resolve
    })
    const getResource = vi.fn(async (url: string) => {
      if (url === human.url) return speciesGate
      if (url === tatooine.url) throw new Error("Request failed (500)")
      if (url === xwing.url) return xwing
      throw new Error(`Unexpected URL ${url}`)
    })
    const client = {
      getPeople: async () => [],
      getPerson: async () => luke(),
      getResource,
    } as SwapiClient
    const person = luke({ starships: [xwing.url] })

    const pending = loadCharacterSections(person, client, createResourceCache())

    expect(getResource).toHaveBeenCalledWith(human.url)
    expect(getResource).toHaveBeenCalledWith(tatooine.url)
    expect(getResource).toHaveBeenCalledWith(xwing.url)
    releaseSpecies(human)

    const sections = await pending
    expect(sections.species).toMatchObject({
      status: "ready",
      data: [expect.objectContaining({ name: "Human" })],
    })
    expect(sections.homeworld).toEqual({
      status: "error",
      message: "Request failed (500)",
    })
    expect(sections.starships).toMatchObject({
      status: "ready",
      data: [expect.objectContaining({ name: "X-wing", className: "Starfighter" })],
    })
    expect(sections.films).toEqual({ status: "empty" })
    expect(sections.vehicles).toEqual({ status: "empty" })
  })

  it("reuses a cached resource when the same character is loaded again", async () => {
    const getResource = vi.fn(async (url: string) => {
      if (url === human.url) return human
      if (url === tatooine.url) return tatooine
      throw new Error(`Unexpected URL ${url}`)
    })
    const client = {
      getPeople: async () => [],
      getPerson: async () => luke(),
      getResource,
    } as SwapiClient
    const cache = createResourceCache()
    const person = luke()

    await loadCharacterSections(person, client, cache)
    await loadCharacterSections(person, client, cache)

    const planetCalls = getResource.mock.calls.filter(([url]) => url === tatooine.url)
    expect(planetCalls).toHaveLength(1)
  })
})
