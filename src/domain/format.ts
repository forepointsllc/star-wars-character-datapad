const UNKNOWN_VALUES = new Set(["unknown", "n/a", "none", "null"])

const ROMAN_NUMERALS: Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
  9: "IX",
}

export function isUnknown(value: string | null | undefined): boolean {
  if (value == null) return true
  const trimmed = value.trim()
  if (!trimmed) return true
  return UNKNOWN_VALUES.has(trimmed.toLowerCase())
}

export function displayValue(value: string | null | undefined): string {
  if (isUnknown(value) || value == null) return "Unknown"
  return value.trim()
}

export function withUnit(value: string | null | undefined, unit: string): string {
  if (isUnknown(value)) return "Unknown"
  return `${value!.trim()} ${unit}`
}

export function formatCount(value: string | null | undefined): string {
  if (isUnknown(value) || value == null) return "Unknown"
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return displayValue(value)
  return numeric.toLocaleString("en-US")
}

export function formatPercent(value: string | null | undefined): string {
  if (isUnknown(value)) return "Unknown"
  return `${value!.trim()}%`
}

export function formatMeasurement(
  value: string | null | undefined,
  unit: string,
): string {
  if (isUnknown(value) || value == null) return "Unknown"
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return `${displayValue(value)} ${unit}`
  return `${numeric.toLocaleString("en-US")} ${unit}`
}

export function episodeLabel(episodeId: number): string {
  const numeral = ROMAN_NUMERALS[episodeId] ?? String(episodeId)
  return `Episode ${numeral}`
}
