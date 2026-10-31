import type { Person } from "../api/types.ts"
import { SWAPI_BASE_URL } from "../api/types.ts"

export function humanSpeciesUrl(baseUrl: string = SWAPI_BASE_URL): string {
  return `${baseUrl.replace(/\/$/, "")}/species/1`
}

export function speciesUrlsFor(
  person: Pick<Person, "species">,
  baseUrl: string = SWAPI_BASE_URL,
): string[] {
  if (person.species.length > 0) return [...person.species]
  return [humanSpeciesUrl(baseUrl)]
}
