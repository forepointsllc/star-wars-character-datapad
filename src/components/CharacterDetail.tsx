import type { ReactNode } from "react"
import type { Person } from "../api/types.ts"
import type { CharacterSections, Section, SectionKey } from "../domain/loadDetails.ts"
import {
  personAttributes,
  type CraftView,
  type FilmView,
  type HomeworldView,
  type SpeciesView,
} from "../domain/views.ts"
import { Placeholder } from "./Placeholder.tsx"

type CharacterDetailProps = {
  person: Person | null
  sections: CharacterSections | null
  onRetry: (section: SectionKey) => void
}

const loadingSections: CharacterSections = {
  species: { status: "loading" },
  homeworld: { status: "loading" },
  films: { status: "loading" },
  starships: { status: "loading" },
  vehicles: { status: "loading" },
}

export function CharacterDetail({ person, sections, onRetry }: CharacterDetailProps) {
  if (!person) {
    return (
      <section className="detail" aria-label="Character details">
        <p className="empty">Select a character to see details.</p>
      </section>
    )
  }

  const related = sections ?? loadingSections

  return (
    <section className="detail" aria-label="Character details">
      <div className="identity">
        <Placeholder kind="person" label="" />
        <h2>{person.name}</h2>
      </div>
      <div className="facts">
        <article className="card" aria-label="Attributes">
          <h3>Attributes</h3>
          <dl>
            {personAttributes(person).map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </article>
        <SpeciesCard section={related.species} onRetry={() => onRetry("species")} />
        <HomeworldCard section={related.homeworld} onRetry={() => onRetry("homeworld")} />
      </div>
      <FilmsCard section={related.films} onRetry={() => onRetry("films")} />
      <div className="craft">
        <CraftColumn
          title="Starships"
          empty="No starships are recorded for this character."
          section={related.starships}
          onRetry={() => onRetry("starships")}
        />
        <CraftColumn
          title="Vehicles"
          empty="No vehicles are recorded for this character."
          section={related.vehicles}
          onRetry={() => onRetry("vehicles")}
        />
      </div>
    </section>
  )
}

function SectionMessage({
  section,
  onRetry,
  empty,
  children,
}: {
  section: Section<unknown>
  onRetry: () => void
  empty: string
  children: ReactNode
}) {
  if (section.status === "loading") return <p className="status">Loading…</p>
  if (section.status === "error") {
    return (
      <div className="section-error">
        <p>{section.message}</p>
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      </div>
    )
  }
  if (section.status === "empty") return <p className="empty">{empty}</p>
  return children
}

function SpeciesCard({
  section,
  onRetry,
}: {
  section: Section<SpeciesView[]>
  onRetry: () => void
}) {
  return (
    <article className="card" aria-label="Species">
      <h3>Species</h3>
      <SectionMessage section={section} onRetry={onRetry} empty="No species is recorded.">
        {section.status === "ready"
          ? section.data.map((species) => (
              <div key={species.name}>
                <p className="species-name">{species.name}</p>
                <dl>
                  <div>
                    <dt>Classification</dt>
                    <dd>{species.classification}</dd>
                  </div>
                  <div>
                    <dt>Designation</dt>
                    <dd>{species.designation}</dd>
                  </div>
                  <div>
                    <dt>Average height</dt>
                    <dd>{species.averageHeight}</dd>
                  </div>
                  <div>
                    <dt>Average lifespan</dt>
                    <dd>{species.averageLifespan}</dd>
                  </div>
                  <div>
                    <dt>Language</dt>
                    <dd>{species.language}</dd>
                  </div>
                </dl>
              </div>
            ))
          : null}
      </SectionMessage>
    </article>
  )
}

function HomeworldCard({
  section,
  onRetry,
}: {
  section: Section<HomeworldView>
  onRetry: () => void
}) {
  return (
    <article className="card" aria-label="Homeworld">
      <h3>Homeworld</h3>
      <SectionMessage section={section} onRetry={onRetry} empty="No homeworld is recorded.">
        {section.status === "ready" ? (
          <>
            <p className="homeworld-name">{section.data.name}</p>
            <dl>
              <div>
                <dt>Population</dt>
                <dd>{section.data.population}</dd>
              </div>
              <div>
                <dt>Terrain</dt>
                <dd>{section.data.terrain}</dd>
              </div>
              <div>
                <dt>Climate</dt>
                <dd>{section.data.climate}</dd>
              </div>
              <div>
                <dt>Surface water</dt>
                <dd>{section.data.surfaceWater}</dd>
              </div>
              <div>
                <dt>Diameter</dt>
                <dd>{section.data.diameter}</dd>
              </div>
              <div>
                <dt>Rotation period</dt>
                <dd>{section.data.rotationPeriod}</dd>
              </div>
              <div>
                <dt>Orbital period</dt>
                <dd>{section.data.orbitalPeriod}</dd>
              </div>
              <div>
                <dt>Gravity</dt>
                <dd>{section.data.gravity}</dd>
              </div>
            </dl>
          </>
        ) : null}
      </SectionMessage>
    </article>
  )
}

function FilmsCard({
  section,
  onRetry,
}: {
  section: Section<FilmView[]>
  onRetry: () => void
}) {
  return (
    <section className="films" aria-label="Films">
      <h3>Films</h3>
      <SectionMessage section={section} onRetry={onRetry} empty="No films are recorded for this character.">
        {section.status === "ready" ? (
          <ul className="film-row">
            {section.data.map((film) => (
              <li className="film" key={`${film.episodeId}-${film.title}`}>
                <Placeholder kind="image" label="" />
                <strong>{film.title}</strong>
                <span>{film.episodeLabel}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </SectionMessage>
    </section>
  )
}

function CraftColumn({
  title,
  empty,
  section,
  onRetry,
}: {
  title: string
  empty: string
  section: Section<CraftView[]>
  onRetry: () => void
}) {
  return (
    <section aria-label={title}>
      <h3>{title}</h3>
      <SectionMessage section={section} onRetry={onRetry} empty={empty}>
        {section.status === "ready"
          ? section.data.map((craft) => (
              <article className="craft-card" key={`${craft.name}-${craft.model}`}>
                <Placeholder kind="craft" label="" />
                <div>
                  <div className="craft-heading">
                    <h4>{craft.name}</h4>
                    <span>{craft.className}</span>
                  </div>
                  <p>
                    Crew / Passengers: {craft.crew} / {craft.passengers}
                  </p>
                  <p>
                    Model / Manufacturer: {craft.model} / {craft.manufacturer}
                  </p>
                </div>
              </article>
            ))
          : null}
      </SectionMessage>
    </section>
  )
}
