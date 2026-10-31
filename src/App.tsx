import { useEffect, useMemo, useState } from "react"
import { createSwapiClient, type SwapiClient } from "./api/client.ts"
import type { Person } from "./api/types.ts"
import { CharacterList } from "./components/CharacterList.tsx"
import { searchPeople } from "./domain/search.ts"

type AppProps = {
  client?: SwapiClient
}

export default function App({ client }: AppProps) {
  const api = useMemo(() => client ?? createSwapiClient(), [client])
  const [people, setPeople] = useState<Person[] | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    api
      .getPeople()
      .then((next) => {
        if (cancelled) return
        setPeople(next)
        setSelectedUrl((current) => {
          if (current && next.some((person) => person.url === current)) return current
          return next[0]?.url ?? null
        })
        setListError(null)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setPeople(null)
        setListError("The character list could not be loaded.")
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [api, attempt])

  const filtered = useMemo(
    () => (people ? searchPeople(people, query) : []),
    [people, query],
  )
  const selected = people?.find((person) => person.url === selectedUrl) ?? null
  const visibleSelection =
    selected && filtered.some((person) => person.url === selected.url)
      ? selected
      : null

  return (
    <div className="page">
      <header className="topbar">
        <h1>Star Wars Character Datapad</h1>
        <label className="search">
          <span className="sr-only">Search characters</span>
          <input
            type="search"
            placeholder="Search characters"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </header>
      <div className="layout">
        <CharacterList
          people={filtered}
          loading={loading}
          error={listError}
          query={query}
          selectedUrl={visibleSelection?.url ?? null}
          onSelect={setSelectedUrl}
          onRetry={() => {
            setLoading(true)
            setListError(null)
            setAttempt((value) => value + 1)
          }}
        />
        <section className="detail" aria-label="Character details">
          {visibleSelection ? (
            <h2>{visibleSelection.name}</h2>
          ) : (
            <p className="empty">Select a character to see details.</p>
          )}
        </section>
      </div>
    </div>
  )
}
