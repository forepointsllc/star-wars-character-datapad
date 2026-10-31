import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { SwapiClient } from "./api/client.ts"
import type { Person } from "./api/types.ts"
import App from "./App.tsx"

const luke = {
  name: "Luke Skywalker",
  height: "172",
  mass: "77",
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

const client: SwapiClient = {
  getPeople: async () => [luke],
  getPerson: async () => luke,
  getResource: async () => {
    throw new Error("not used yet")
  },
}

describe("App", () => {
  it("shows the datapad title", async () => {
    render(<App client={client} />)
    expect(
      screen.getByRole("heading", { name: "Star Wars Character Datapad" }),
    ).toBeInTheDocument()
    expect(await screen.findByRole("button", { name: "Luke Skywalker" })).toBeInTheDocument()
  })
})
