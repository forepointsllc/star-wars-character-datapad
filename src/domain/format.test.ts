import { describe, expect, it } from "vitest"
import {
  displayValue,
  episodeLabel,
  formatCount,
  formatMeasurement,
  formatPercent,
  withUnit,
} from "./format.ts"

describe("display values", () => {
  it("keeps a known value and trims it", () => {
    expect(displayValue(" blond ")).toBe("blond")
  })

  it.each(["unknown", "n/a", "none", "  NULL ", "", null, undefined])(
    "renders %s as Unknown",
    (value) => {
      expect(displayValue(value)).toBe("Unknown")
    },
  )

  it("adds a unit only for a known value", () => {
    expect(withUnit("172", "cm")).toBe("172 cm")
    expect(withUnit("unknown", "kg")).toBe("Unknown")
  })

  it("formats population and diameter with thousands separators", () => {
    expect(formatCount("200000")).toBe("200,000")
    expect(formatMeasurement("10465", "km")).toBe("10,465 km")
    expect(formatCount("unknown")).toBe("Unknown")
  })

  it("formats surface water as a percent and leaves gravity untouched", () => {
    expect(formatPercent("1")).toBe("1%")
    expect(formatPercent("unknown")).toBe("Unknown")
  })

  it("uses Roman numerals for episode labels", () => {
    expect(episodeLabel(1)).toBe("Episode I")
    expect(episodeLabel(4)).toBe("Episode IV")
    expect(episodeLabel(6)).toBe("Episode VI")
  })
})
