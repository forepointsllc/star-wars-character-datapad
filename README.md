# Star Wars Character Datapad

A single-page browser for Star Wars characters, backed by the public [SWAPI](https://swapi.info) API.

The screen lets someone search the character list, select a person, and read attributes, species, homeworld, films, starships, and vehicles. Film, starship, and vehicle pages are intentionally not separate routes.

## Install and run

```bash
npm install
npm run dev
```

Open the URL Vite prints, usually `http://127.0.0.1:5173/`.

```bash
npm test
npm run build
```

`npm test` runs Vitest once. `npm run test:watch` keeps the suite running. Tests do not call the live API.

## Assumptions

- `https://swapi.info/api/people` returns the full list of 82 people in one JSON array. This is not the older paginated `{ results, next }` shape.
- The browser calls SWAPI directly. The API sends `access-control-allow-origin: *`.
- An empty `species` array means Human. SWAPI omits Human on many people, including Luke Skywalker. The app then requests `https://swapi.info/api/species/1`. The alternative was to show "Unknown", which would disagree with both the wireframe and the Human record in the API.
- Films are the ones the API lists for that person, sorted by `episode_id`. Luke has four films. The wireframe draws six; that drawing is a layout sample, not the data.
- Values `unknown`, `n/a`, `none`, `null`, and blank text render as "Unknown", with no unit appended.
- SWAPI stores the unknown planet's diameter, rotation period, and orbital period as `"0"`. Those three fields render as "Unknown". A crew or passenger count of `0` stays `0`, because that is a real count on ships such as the X-wing.
- Text is shown as the API spells it. Luke's hair color stays `blond`.
- The first character is selected after the list loads, so the page is not empty. If a search hides that person, the detail pane asks for a new selection. Clearing the search restores the previous selection.
- Images are placeholders. There are no links to film, starship, or vehicle pages.

## Technical approach

Three layers, and the UI does not format data or call `fetch`.

- `src/api` fetches the people list, one person, and any resource by URL. It turns network failures, non-OK responses, and invalid JSON into `SwapiError`. A small in-memory cache stores successful resource promises by URL and drops failures so retry can run again.
- `src/domain` is pure aside from the loader that asks the client for related records. It owns search, units, episode labels, the Human species rule, and assembly of each detail section.
- `src/components` and `App.tsx` render what the domain already decided, including loading, empty, and error states.

Related records for the selected character load together with `Promise.all`. If the homeworld request fails, attributes, species, films, starships, and vehicles still render, and the homeworld card has its own retry.

## Decisions and tradeoffs

- No backend. A server would add a process and a second failure mode for a public, CORS-open, 45 KB list.
- No router and no global store. The screen is one view and the selection is local state.
- Search filters the list already in memory. Debouncing and a server query would not change the result for 82 names.
- The cache lives for the current page session. A reload fetches again. Persistence was more machinery than this exercise needed.
- Tests cover the rules that would be expensive to get wrong: formatting, search, client failures, parallel loading, a cached second load, a failed section that does not blank the page, and the main screen states. There are no screenshot tests and no matrix of every SWAPI field.

## Risks and limitations

- swapi.info is a third-party static host. If it is down or changes its JSON, the app fails at runtime. The tests mock `fetch` and the client, so they will not catch a production contract change.
- The Human fallback assumes species `1` remains Human.
- The in-memory cache can serve a record for the life of the tab even if the upstream file changed.
- Partial failure is handled per section, not per item inside a section. One failed starship fails the starship section.

## Next steps

- A contract check against the live API in a scheduled job, separate from the unit suite.
- Keyboard operation of the character list, and a fuller pass on focus order.
- Keep a failed item out of a list without failing the whole section.
- Persist the resource cache only if the same records are opened across reloads often enough to matter.

## AI-assisted development

This repository was implemented with Cursor's coding agent from the exercise brief. The agent drafted the slices. The result was checked with `npm test` and `npm run build`, and by using the running app: the list loads Luke, search narrows to one character and to no matches, selecting Yoda shows his species and an unknown homeworld, and the narrow layout stacks the list above the detail pane. The boundaries, the Human assumption, the decision to follow API film data, and the choice to skip a backend are the decisions to defend. The agent did not replace that judgment.

## Maintaining and extending

Add a display rule in `src/domain`, with a unit test, before rendering it. Add a new related record by loading it in `src/domain/loadDetails.ts` and rendering the section in `CharacterDetail`. Leave `fetch` inside `src/api/client.ts`.

To explain the app to someone else, start with the three layers, then the choice to keep a failed homeworld on its own card, then one thing that was left out on purpose: no backend, no extra routes, and no pixel-perfect CSS.
