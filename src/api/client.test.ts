import { describe, expect, it, vi } from "vitest"
import { createSwapiClient, SwapiError } from "./client.ts"
import type { Person } from "./types.ts"

const luke = {
  name: "Luke Skywalker",
  url: "https://swapi.info/api/people/1",
} as Person

function fetchJson(body: unknown, status = 200): typeof fetch {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })) as unknown as typeof fetch
}

describe("createSwapiClient", () => {
  it("loads the people list from the collection URL", async () => {
    const fetchImpl = fetchJson([luke])
    const client = createSwapiClient(fetchImpl, "https://swapi.info/api")

    await expect(client.getPeople()).resolves.toEqual([luke])
    expect(fetchImpl).toHaveBeenCalledWith("https://swapi.info/api/people")
  })

  it("loads one person by id", async () => {
    const fetchImpl = fetchJson(luke)
    const client = createSwapiClient(fetchImpl, "https://swapi.info/api")

    await expect(client.getPerson("1")).resolves.toEqual(luke)
    expect(fetchImpl).toHaveBeenCalledWith("https://swapi.info/api/people/1")
  })

  it("loads a related resource from its URL", async () => {
    const planet = { name: "Tatooine" }
    const fetchImpl = fetchJson(planet)
    const client = createSwapiClient(fetchImpl)

    await expect(
      client.getResource("https://swapi.info/api/planets/1"),
    ).resolves.toEqual(planet)
  })

  it("rejects a non-OK response with the status code", async () => {
    const client = createSwapiClient(fetchJson({}, 503), "https://swapi.info/api")

    await expect(client.getPeople()).rejects.toMatchObject({
      name: "SwapiError",
      status: 503,
      message: "Request failed (503)",
    })
  })

  it("rejects invalid JSON", async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Unexpected token")
      },
    })) as unknown as typeof fetch
    const client = createSwapiClient(fetchImpl, "https://swapi.info/api")

    await expect(client.getPerson("1")).rejects.toBeInstanceOf(SwapiError)
    await expect(client.getPerson("1")).rejects.toThrow(
      "The response was not valid JSON",
    )
  })

  it("rejects a network failure", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("Failed to fetch")
    }) as unknown as typeof fetch
    const client = createSwapiClient(fetchImpl, "https://swapi.info/api")

    await expect(client.getPeople()).rejects.toThrow("The network request failed")
  })

  it("rejects a people payload that is not a list", async () => {
    const client = createSwapiClient(
      fetchJson({ results: [] }),
      "https://swapi.info/api",
    )

    await expect(client.getPeople()).rejects.toThrow(
      "The people response was not a list",
    )
  })
})
