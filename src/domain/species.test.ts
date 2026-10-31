import { describe, expect, it } from "vitest"
import { humanSpeciesUrl, speciesUrlsFor } from "./species.ts"

describe("speciesUrlsFor", () => {
  it("uses the recorded species when the person has one", () => {
    expect(
      speciesUrlsFor({
        species: ["https://swapi.info/api/species/2"],
      }),
    ).toEqual(["https://swapi.info/api/species/2"])
  })

  it("requests the Human species when SWAPI leaves the list empty", () => {
    expect(speciesUrlsFor({ species: [] })).toEqual([
      "https://swapi.info/api/species/1",
    ])
    expect(humanSpeciesUrl("https://swapi.info/api/")).toBe(
      "https://swapi.info/api/species/1",
    )
  })
})
