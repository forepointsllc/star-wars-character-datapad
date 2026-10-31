import type { Person } from "../api/types.ts"

type CharacterListProps = {
  people: Person[]
  loading: boolean
  error: string | null
  query: string
  selectedUrl: string | null
  onSelect: (url: string) => void
  onRetry: () => void
}

export function CharacterList({
  people,
  loading,
  error,
  query,
  selectedUrl,
  onSelect,
  onRetry,
}: CharacterListProps) {
  return (
    <section className="panel" aria-labelledby="characters-heading">
      <h2 id="characters-heading">Characters</h2>
      {loading ? <p className="status">Loading characters…</p> : null}
      {!loading && error ? (
        <div className="status">
          <p>{error}</p>
          <button type="button" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : null}
      {!loading && !error && people.length === 0 ? (
        <p className="empty">
          {query.trim()
            ? `No characters match "${query.trim()}".`
            : "No characters were returned."}
        </p>
      ) : null}
      {!loading && !error && people.length > 0 ? (
        <ul className="character-list">
          {people.map((person) => {
            const selected = person.url === selectedUrl
            return (
              <li key={person.url}>
                <button
                  type="button"
                  className={selected ? "selected" : undefined}
                  aria-current={selected ? "true" : undefined}
                  onClick={() => onSelect(person.url)}
                >
                  {person.name}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}
