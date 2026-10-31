import { SWAPI_BASE_URL, type Person } from "./types.ts"

export class SwapiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "SwapiError"
    this.status = status
  }
}

export type SwapiClient = {
  getPeople: () => Promise<Person[]>
  getPerson: (id: string) => Promise<Person>
  getResource: <T>(url: string) => Promise<T>
}

export function createSwapiClient(
  fetchImpl: typeof fetch = fetch,
  baseUrl: string = SWAPI_BASE_URL,
): SwapiClient {
  async function getJson<T>(url: string): Promise<T> {
    let response: Response
    try {
      response = await fetchImpl(url)
    } catch {
      throw new SwapiError("The network request failed")
    }

    if (!response.ok) {
      throw new SwapiError(`Request failed (${response.status})`, response.status)
    }

    try {
      return (await response.json()) as T
    } catch {
      throw new SwapiError("The response was not valid JSON")
    }
  }

  return {
    async getPeople() {
      const data = await getJson<unknown>(`${baseUrl}/people`)
      if (!Array.isArray(data)) {
        throw new SwapiError("The people response was not a list")
      }
      return data as Person[]
    },
    getPerson(id: string) {
      return getJson<Person>(`${baseUrl}/people/${id}`)
    },
    getResource<T>(url: string) {
      return getJson<T>(url)
    },
  }
}
