import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import type { SwapiClient } from "./api/client.ts"
import type { Film, Person, Planet, Species, Starship, Vehicle } from "./api/types.ts"
import App from "./App.tsx"

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

const hope = {
  title: "A New Hope",
  episode_id: 4,
  url: "https://swapi.info/api/films/1",
} as Film

const sith = {
  title: "Revenge of the Sith",
  episode_id: 3,
  url: "https://swapi.info/api/films/6",
} as Film

const xwing = {
  name: "X-wing",
  model: "T-65 X-wing",
  manufacturer: "Incom Corporation",
  starship_class: "Starfighter",
  crew: "1",
  passengers: "0",
  url: "https://swapi.info/api/starships/12",
} as Starship

const speeder = {
  name: "Snowspeeder",
  model: "t-47 airspeeder",
  manufacturer: "Incom corporation",
  vehicle_class: "airspeeder",
  crew: "2",
  passengers: "0",
  url: "https://swapi.info/api/vehicles/14",
} as Vehicle

function person(name: string, id: string, overrides: Partial<Person> = {}): Person {
  return {
    name,
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
    url: `https://swapi.info/api/people/${id}`,
    ...overrides,
  }
}

const luke = person("Luke Skywalker", "1", {
  films: [hope.url, sith.url],
  starships: [xwing.url],
  vehicles: [speeder.url],
})
const leia = person("Leia Organa", "5", { hair_color: "brown", mass: "49" })
const vader = person("Darth Vader", "4")

const resources: Record<string, unknown> = {
  [human.url]: human,
  [tatooine.url]: tatooine,
  [hope.url]: hope,
  [sith.url]: sith,
  [xwing.url]: xwing,
  [speeder.url]: speeder,
}

const defaultGetResource = (async (url: string) => {
  if (url in resources) return resources[url]
  throw new Error(`Unexpected URL ${url}`)
}) as SwapiClient["getResource"]

function clientFor(
  people: Person[],
  getResource: SwapiClient["getResource"] = defaultGetResource,
): SwapiClient {
  return {
    getPeople: async () => people,
    getPerson: async (id) => {
      const found = people.find((entry) => entry.url.endsWith(`/${id}`))
      if (!found) throw new Error(`Missing person ${id}`)
      return found
    },
    getResource,
  }
}

describe("character datapad", () => {
  it("lists characters and shows the first character's related records", async () => {
    render(<App client={clientFor([luke, leia, vader])} />)

    expect(
      screen.getByRole("heading", { name: "Star Wars Character Datapad" }),
    ).toBeInTheDocument()
    expect(await screen.findByRole("button", { name: "Leia Organa" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Luke Skywalker" })).toBeInTheDocument()
    expect(await screen.findByText("Human")).toBeInTheDocument()
    expect(screen.getByText("Tatooine")).toBeInTheDocument()
    expect(screen.getByText("200,000")).toBeInTheDocument()
    expect(screen.getByText("1 standard")).toBeInTheDocument()
    expect(screen.getByText("blond")).toBeInTheDocument()

    const films = screen.getByRole("region", { name: "Films" })
    expect(films).toHaveTextContent("Revenge of the Sith")
    expect(films).toHaveTextContent("Episode III")
    expect(films.textContent?.indexOf("Episode III")).toBeLessThan(
      films.textContent?.indexOf("Episode IV") ?? -1,
    )
    expect(screen.getByText("X-wing")).toBeInTheDocument()
    expect(screen.getByText("Snowspeeder")).toBeInTheDocument()
  })

  it("filters by name and shows an empty state when nothing matches", async () => {
    const user = userEvent.setup()
    render(<App client={clientFor([luke, leia, vader])} />)
    await screen.findByRole("button", { name: "Darth Vader" })

    await user.type(screen.getByRole("searchbox", { name: "Search characters" }), "leia")

    expect(screen.getByRole("button", { name: "Leia Organa" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Luke Skywalker" })).not.toBeInTheDocument()
    expect(screen.getByText("Select a character to see details.")).toBeInTheDocument()

    await user.type(screen.getByRole("searchbox", { name: "Search characters" }), "zzz")
    expect(screen.getByText('No characters match "leiazzz".')).toBeInTheDocument()
  })

  it("shows the character chosen from the list", async () => {
    const user = userEvent.setup()
    render(<App client={clientFor([luke, leia])} />)
    await user.click(await screen.findByRole("button", { name: "Leia Organa" }))

    expect(screen.getByRole("heading", { name: "Leia Organa" })).toBeInTheDocument()
    expect(
      await screen.findByText("No starships are recorded for this character."),
    ).toBeInTheDocument()
    expect(screen.getByText("No vehicles are recorded for this character.")).toBeInTheDocument()
    expect(screen.getByText("No films are recorded for this character.")).toBeInTheDocument()
  })

  it("lets the user retry a failed character list", async () => {
    const user = userEvent.setup()
    let failed = true
    const client = clientFor([luke])
    client.getPeople = async () => {
      if (failed) throw new Error("down")
      return [luke]
    }

    render(<App client={client} />)
    expect(
      await screen.findByText("The character list could not be loaded."),
    ).toBeInTheDocument()

    failed = false
    await user.click(screen.getByRole("button", { name: "Try again" }))
    expect(await screen.findByRole("button", { name: "Luke Skywalker" })).toBeInTheDocument()
  })

  it("keeps attributes visible when the homeworld request fails, then retries that section", async () => {
    const user = userEvent.setup()
    let planetFails = true
    render(
      <App
        client={clientFor(
          [luke],
          (async (url: string) => {
            if (url === tatooine.url && planetFails) throw new Error("Request failed (500)")
            if (url in resources) return resources[url]
            throw new Error(`Unexpected URL ${url}`)
          }) as SwapiClient["getResource"],
        )}
      />,
    )

    const homeworld = await screen.findByRole("article", { name: "Homeworld" })
    expect(await within(homeworld).findByText("Request failed (500)")).toBeInTheDocument()
    expect(screen.getByText("19BBY")).toBeInTheDocument()
    expect(screen.getByText("Human")).toBeInTheDocument()

    planetFails = false
    await user.click(within(homeworld).getByRole("button", { name: "Try again" }))
    expect(await within(homeworld).findByText("Tatooine")).toBeInTheDocument()
  })
})
