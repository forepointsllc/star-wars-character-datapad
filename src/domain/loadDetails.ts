import type { ResourceCache } from "../api/cache.ts"
import type { SwapiClient } from "../api/client.ts"
import type { Film, Person, Planet, Species, Starship, Vehicle } from "../api/types.ts"
import { speciesUrlsFor } from "./species.ts"
import {
  toFilmViews,
  toHomeworldView,
  toSpeciesView,
  toStarshipView,
  toVehicleView,
  type CraftView,
  type FilmView,
  type HomeworldView,
  type SpeciesView,
} from "./views.ts"

export type Section<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "empty" }
  | { status: "error"; message: string }

export type CharacterSections = {
  species: Section<SpeciesView[]>
  homeworld: Section<HomeworldView>
  films: Section<FilmView[]>
  starships: Section<CraftView[]>
  vehicles: Section<CraftView[]>
}

export type SectionKey = keyof CharacterSections

function failed(error: unknown): { status: "error"; message: string } {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "This information could not be loaded."
  return { status: "error", message }
}

async function loadOne<T>(
  url: string,
  client: SwapiClient,
  cache: ResourceCache,
): Promise<T> {
  return cache.load(url, (resourceUrl) => client.getResource<T>(resourceUrl))
}

async function loadSpecies(
  person: Person,
  client: SwapiClient,
  cache: ResourceCache,
): Promise<CharacterSections["species"]> {
  try {
    const records = await Promise.all(
      speciesUrlsFor(person).map((url) => loadOne<Species>(url, client, cache)),
    )
    return { status: "ready", data: records.map(toSpeciesView) }
  } catch (error) {
    return failed(error)
  }
}

async function loadHomeworld(
  person: Person,
  client: SwapiClient,
  cache: ResourceCache,
): Promise<CharacterSections["homeworld"]> {
  if (!person.homeworld) return { status: "empty" }
  try {
    const planet = await loadOne<Planet>(person.homeworld, client, cache)
    return { status: "ready", data: toHomeworldView(planet) }
  } catch (error) {
    return failed(error)
  }
}

async function loadFilms(
  person: Person,
  client: SwapiClient,
  cache: ResourceCache,
): Promise<CharacterSections["films"]> {
  if (person.films.length === 0) return { status: "empty" }
  try {
    const films = await Promise.all(
      person.films.map((url) => loadOne<Film>(url, client, cache)),
    )
    return { status: "ready", data: toFilmViews(films) }
  } catch (error) {
    return failed(error)
  }
}

async function loadStarships(
  person: Person,
  client: SwapiClient,
  cache: ResourceCache,
): Promise<CharacterSections["starships"]> {
  return loadCraft(person.starships, async (url) =>
    toStarshipView(await loadOne<Starship>(url, client, cache)),
  )
}

async function loadVehicles(
  person: Person,
  client: SwapiClient,
  cache: ResourceCache,
): Promise<CharacterSections["vehicles"]> {
  return loadCraft(person.vehicles, async (url) =>
    toVehicleView(await loadOne<Vehicle>(url, client, cache)),
  )
}

async function loadCraft(
  urls: string[],
  loadView: (url: string) => Promise<CraftView>,
): Promise<Section<CraftView[]>> {
  if (urls.length === 0) return { status: "empty" }
  try {
    const data = await Promise.all(urls.map((url) => loadView(url)))
    return { status: "ready", data }
  } catch (error) {
    return failed(error)
  }
}

const loaders = {
  species: loadSpecies,
  homeworld: loadHomeworld,
  films: loadFilms,
  starships: loadStarships,
  vehicles: loadVehicles,
}

export function loadCharacterSection<K extends SectionKey>(
  key: K,
  person: Person,
  client: SwapiClient,
  cache: ResourceCache,
): Promise<CharacterSections[K]> {
  return loaders[key](person, client, cache) as Promise<CharacterSections[K]>
}

export async function loadCharacterSections(
  person: Person,
  client: SwapiClient,
  cache: ResourceCache,
): Promise<CharacterSections> {
  const [species, homeworld, films, starships, vehicles] = await Promise.all([
    loadSpecies(person, client, cache),
    loadHomeworld(person, client, cache),
    loadFilms(person, client, cache),
    loadStarships(person, client, cache),
    loadVehicles(person, client, cache),
  ])

  return { species, homeworld, films, starships, vehicles }
}
