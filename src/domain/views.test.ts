import { describe, expect, it } from "vitest"
import type { Film, Person, Planet, Species } from "../api/types.ts"
import { personAttributes, toFilmViews, toHomeworldView, toSpeciesView } from "./views.ts"

const luke = {
  name: "Luke Skywalker",
  height: "172",
  mass: "unknown",
  hair_color: "blond",
  skin_color: "fair",
  eye_color: "blue",
  birth_year: "19BBY",
  gender: "male",
  homeworld: "https://swapi.info/api/planets/1",
  films: [],
  species: [],
  vehicles: [],
  starships: [],
  url: "https://swapi.info/api/people/1",
} as Person

describe("view models", () => {
  it("formats person attributes and leaves API spelling unchanged", () => {
    expect(personAttributes(luke)).toEqual([
      { label: "Birth year", value: "19BBY" },
      { label: "Gender", value: "male" },
      { label: "Height", value: "172 cm" },
      { label: "Mass", value: "Unknown" },
      { label: "Eye color", value: "blue" },
      { label: "Hair color", value: "blond" },
      { label: "Skin color", value: "fair" },
    ])
  })

  it("formats a species card", () => {
    const human = {
      name: "Human",
      classification: "mammal",
      designation: "sentient",
      average_height: "180",
      average_lifespan: "120",
      language: "Galactic Basic",
      url: "https://swapi.info/api/species/1",
    } as Species

    expect(toSpeciesView(human)).toMatchObject({
      name: "Human",
      averageHeight: "180 cm",
      averageLifespan: "120 yr",
      language: "Galactic Basic",
    })
  })

  it("formats a homeworld without adding a second gravity unit", () => {
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

    expect(toHomeworldView(tatooine)).toMatchObject({
      name: "Tatooine",
      population: "200,000",
      surfaceWater: "1%",
      diameter: "10,465 km",
      rotationPeriod: "23 hr",
      orbitalPeriod: "304 d",
      gravity: "1 standard",
    })
  })

  it("treats SWAPI's zero planet measurements as unknown", () => {
    const unknownPlanet = {
      name: "unknown",
      population: "unknown",
      terrain: "unknown",
      climate: "unknown",
      surface_water: "unknown",
      diameter: "0",
      rotation_period: "0",
      orbital_period: "0",
      gravity: "unknown",
      url: "https://swapi.info/api/planets/28",
    } as Planet

    expect(toHomeworldView(unknownPlanet)).toMatchObject({
      name: "Unknown",
      population: "Unknown",
      diameter: "Unknown",
      rotationPeriod: "Unknown",
      orbitalPeriod: "Unknown",
      gravity: "Unknown",
    })
  })

  it("sorts films by episode", () => {
    const films = [
      { title: "A New Hope", episode_id: 4, url: "https://swapi.info/api/films/1" },
      { title: "Revenge of the Sith", episode_id: 3, url: "https://swapi.info/api/films/6" },
    ] as Film[]

    expect(toFilmViews(films).map((film) => film.episodeLabel)).toEqual([
      "Episode III",
      "Episode IV",
    ])
  })
})
