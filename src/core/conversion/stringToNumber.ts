/**
 * parses any string input to a number with support for:
 * percentage: 20% => 0.2, 12.5% => 0.125 etc
 * currency: 20.5€ => 20.5
 * @param input 
 * @returns 
 */
export function stringToNumber(input: string): number {
  if (typeof input !== "string") throw new TypeError("string expected")
  let s = input.trim()
  if (!s) throw new Error("empty string")

  s = s.replace(/[\u00A0\u202F\s]/g, "").replace(/_/g, "")

  let isPercent = false
  if (s.endsWith("%")) {
    isPercent = true
    s = s.slice(0, -1)
  }
  let isCurrency = false
  if (/\p{Sc}$/u.test(s)) {
    isCurrency = true
    s = s.slice(0, -1)
  } else if (/^\p{Sc}/u.test(s)) {
    isCurrency = true
    s = s.slice(1)
  }

  const hasDot = s.includes(".")
  const hasComma = s.includes(",")
  if (hasDot && hasComma) {
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(/,/g, ".")
    } else {
      s = s.replace(/,/g, "")
    }
  } else if (hasComma && !hasDot) {
    s = /^\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, "") : s.replace(/,/g, ".")
  } else if (hasDot && !hasComma) {
    if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "")
  }

  if (!/^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(s)) {
    return 0
  }

  const n = Number(s)
  if (!Number.isFinite(n)) return 0

  return isPercent ? n / 100 : n
}