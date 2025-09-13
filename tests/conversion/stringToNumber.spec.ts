import { describe, expect, it } from "vitest"
import { stringToNumber } from "../../src/core/conversion/stringToNumber"


describe("StringToNumber", () => {

  it("should parse garbage", async () => {
    expect(stringToNumber("GARBAGE")).toBe(0)
    expect(stringToNumber("123NumberGarbage")).toBe(0)
    expect(stringToNumber("12_3% NumberGarbage")).toBe(0)
    expect(stringToNumber("12_3€ NumberGarbage")).toBe(0)
    expect(stringToNumber("$12_3€")).toBe(0)
  })

  it("should parse currency", async () => {
    expect(stringToNumber("123€")).toBe(123)
    expect(stringToNumber("12_3.5€")).toBe(123.5)
    expect(stringToNumber("$123")).toBe(123)
    expect(stringToNumber("$12_3.5")).toBe(123.5)
  })

  it("should parse a simple number", async () => {
    expect(stringToNumber("2_000")).toBe(2000)
    expect(stringToNumber(" 0.03 ")).toBe(0.03)
    expect(stringToNumber(" -0.15 ")).toBe(-0.15)
  })

  it("should parse a percentage", async () => {
    expect(stringToNumber("20%")).toBe(0.2)
    expect(stringToNumber(" 1_2.5% ")).toBe(0.125)
  })
  
})