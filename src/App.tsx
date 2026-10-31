import { useEffect, useMemo, useRef, useState } from "react"
import { createResourceCache } from "./api/cache.ts"
import { createSwapiClient, type SwapiClient } from "./api/client.ts"
import type { Person } from "./api/types.ts"
import { CharacterDetail } from "./components/CharacterDetail.tsx"
import { CharacterList } from "./components/CharacterList.tsx"
import {
  loadCharacterSection,
  loadCharacterSections,
  type CharacterSections,
  type SectionKey,
} from "./domain/loadDetails.ts"
import { searchPeople } from "./domain/search.ts"

type AppProps = {
  client?: SwapiClient
}

export default function App({ client }: AppProps) {
  const api = useMemo(() => client ?? createSwapiClient(), [client])
  const cache = useMemo(() => createResourceCache(), [])
  const [people, setPeople] = useState<Person[] | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [sections, setSections] = useState<CharacterSections | null>(null)
  const [sectionsUrl, setSectionsUrl] = useState<string | null>(null)
  const selectedUrlRef = useRef(selectedUrl)
  useEffect(() => {
    selectedUrlRef.current = selectedUrl
  }, [selectedUrl])

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
  const related =
    visibleSelection && sections && sectionsUrl === visibleSelection.url
      ? sections
      : null

  useEffect(() => {
    if (!visibleSelection) return
    let cancelled = false
    const url = visibleSelection.url
    loadCharacterSections(visibleSelection, api, cache).then((next) => {
      if (cancelled) return
      setSections(next)
      setSectionsUrl(url)
    })
    return () => {
      cancelled = true
    }
  }, [visibleSelection, api, cache])

  function retrySection(section: SectionKey) {
    if (!visibleSelection || !related) return
    const url = visibleSelection.url
    setSections({ ...related, [section]: { status: "loading" } })
    loadCharacterSection(section, visibleSelection, api, cache).then((next) => {
      if (selectedUrlRef.current !== url) return
      setSections((current) => (current ? { ...current, [section]: next } : current))
    })
  }

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
        <CharacterDetail
          person={visibleSelection}
          sections={related}
          onRetry={retrySection}
        />
      </div>
    </div>
  )
}
