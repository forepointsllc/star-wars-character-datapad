import { describe, expect, it } from "vitest"
import type { Person } from "../api/types.ts"
import { searchPeople } from "./search.ts"

function person(name: string): Person {
  return {
    name,
    height: "180",
    mass: "80",
    hair_color: "brown",
    skin_color: "fair",
    eye_color: "blue",
    birth_year: "19BBY",
    gender: "male",
    homeworld: "https://swapi.info/api/planets/1",
    films: [],
    species: [],
    vehicles: [],
    starships: [],
    url: `https://swapi.info/api/people/${name}`,
  }
}

const people = [person("Luke Skywalker"), person("Darth Vader"), person("Leia Organa")]

describe("searchPeople", () => {
  it("returns everyone when the query is blank", () => {
    expect(searchPeople(people, "  ")).toHaveLength(3)
  })

  it("matches a name regardless of case", () => {
    expect(searchPeople(people, "leia").map((entry) => entry.name)).toEqual([
      "Leia Organa",
    ])
  })

  it("returns no one when nothing matches", () => {
    expect(searchPeople(people, "yoda")).toEqual([])
  })
})
