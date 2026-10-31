export const SWAPI_BASE_URL = "https://swapi.info/api"

export type Person = {
  name: string
  height: string
  mass: string
  hair_color: string
  skin_color: string
  eye_color: string
  birth_year: string
  gender: string
  homeworld: string
  films: string[]
  species: string[]
  vehicles: string[]
  starships: string[]
  url: string
}

export type Species = {
  name: string
  classification: string
  designation: string
  average_height: string
  average_lifespan: string
  language: string
  url: string
}

export type Planet = {
  name: string
  population: string
  terrain: string
  climate: string
  surface_water: string
  diameter: string
  rotation_period: string
  orbital_period: string
  gravity: string
  url: string
}

export type Film = {
  title: string
  episode_id: number
  url: string
}

export type Starship = {
  name: string
  model: string
  manufacturer: string
  starship_class: string
  crew: string
  passengers: string
  url: string
}

export type Vehicle = {
  name: string
  model: string
  manufacturer: string
  vehicle_class: string
  crew: string
  passengers: string
  url: string
}
