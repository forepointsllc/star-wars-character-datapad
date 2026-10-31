import type { Person } from "../api/types.ts"

export function searchPeople(people: readonly Person[], query: string): Person[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return [...people]
  return people.filter((person) => person.name.toLowerCase().includes(needle))
}
