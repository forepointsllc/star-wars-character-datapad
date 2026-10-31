import type { Film, Person, Planet, Species, Starship, Vehicle } from "../api/types.ts"
import {
  displayValue,
  episodeLabel,
  formatCount,
  formatMeasurement,
  formatPercent,
  withUnit,
} from "./format.ts"

export type AttributeRow = {
  label: string
  value: string
}

export type SpeciesView = {
  name: string
  classification: string
  designation: string
  averageHeight: string
  averageLifespan: string
  language: string
}

export type HomeworldView = {
  name: string
  population: string
  terrain: string
  climate: string
  surfaceWater: string
  diameter: string
  rotationPeriod: string
  orbitalPeriod: string
  gravity: string
}

export type FilmView = {
  title: string
  episodeId: number
  episodeLabel: string
}

export type CraftView = {
  name: string
  className: string
  crew: string
  passengers: string
  model: string
  manufacturer: string
}

export function personAttributes(person: Person): AttributeRow[] {
  return [
    { label: "Birth year", value: displayValue(person.birth_year) },
    { label: "Gender", value: displayValue(person.gender) },
    { label: "Height", value: withUnit(person.height, "cm") },
    { label: "Mass", value: withUnit(person.mass, "kg") },
    { label: "Eye color", value: displayValue(person.eye_color) },
    { label: "Hair color", value: displayValue(person.hair_color) },
    { label: "Skin color", value: displayValue(person.skin_color) },
  ]
}

export function toSpeciesView(species: Species): SpeciesView {
  return {
    name: displayValue(species.name),
    classification: displayValue(species.classification),
    designation: displayValue(species.designation),
    averageHeight: withUnit(species.average_height, "cm"),
    averageLifespan: withUnit(species.average_lifespan, "yr"),
    language: displayValue(species.language),
  }
}

function planetMeasurement(
  value: string,
  format: (value: string) => string,
): string {
  // SWAPI records the unknown planet's missing measurements as "0".
  if (value.trim() === "0") return "Unknown"
  return format(value)
}

export function toHomeworldView(planet: Planet): HomeworldView {
  return {
    name: displayValue(planet.name),
    population: formatCount(planet.population),
    terrain: displayValue(planet.terrain),
    climate: displayValue(planet.climate),
    surfaceWater: formatPercent(planet.surface_water),
    diameter: planetMeasurement(planet.diameter, (value) => formatMeasurement(value, "km")),
    rotationPeriod: planetMeasurement(planet.rotation_period, (value) => withUnit(value, "hr")),
    orbitalPeriod: planetMeasurement(planet.orbital_period, (value) => withUnit(value, "d")),
    gravity: displayValue(planet.gravity),
  }
}

export function toFilmViews(films: readonly Film[]): FilmView[] {
  return films
    .map((film) => ({
      title: displayValue(film.title),
      episodeId: film.episode_id,
      episodeLabel: episodeLabel(film.episode_id),
    }))
    .sort((left, right) => left.episodeId - right.episodeId)
}

export function toStarshipView(starship: Starship): CraftView {
  return toCraftView({
    name: starship.name,
    className: starship.starship_class,
    crew: starship.crew,
    passengers: starship.passengers,
    model: starship.model,
    manufacturer: starship.manufacturer,
  })
}

export function toVehicleView(vehicle: Vehicle): CraftView {
  return toCraftView({
    name: vehicle.name,
    className: vehicle.vehicle_class,
    crew: vehicle.crew,
    passengers: vehicle.passengers,
    model: vehicle.model,
    manufacturer: vehicle.manufacturer,
  })
}

function toCraftView(craft: {
  name: string
  className: string
  crew: string
  passengers: string
  model: string
  manufacturer: string
}): CraftView {
  return {
    name: displayValue(craft.name),
    className: displayValue(craft.className),
    crew: displayValue(craft.crew),
    passengers: displayValue(craft.passengers),
    model: displayValue(craft.model),
    manufacturer: displayValue(craft.manufacturer),
  }
}
