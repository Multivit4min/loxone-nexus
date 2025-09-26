import { describe, expect, it, beforeEach } from "vitest"
import { VariableConverter } from "../../src/core/conversion/VariableConverter"


describe("VariableConverter", () => {

  describe("parse a number to different formats", async () => {
    let converter: VariableConverter[] = []

    beforeEach(() => {
      converter = []
      converter.push(new VariableConverter({ type: "number", value: 123 }))
      converter.push(new VariableConverter({ type: "number", value: 85 }))
      converter.push(new VariableConverter({ type: "number", value: 0 }))
    })

    it("should parse to a boolean", () => {
      expect(converter[0].toBoolean()).toBe(true)
      expect(converter[1].toBoolean()).toBe(true)
      expect(converter[2].toBoolean()).toBe(false)
    })

    it("should parse to a number", () => {
      expect(converter[0].toNumber()).toBe(123)
      expect(converter[1].toNumber()).toBe(85)
      expect(converter[2].toNumber()).toBe(0)
    })

    it("should parse to a string", () => {
      expect(converter[0].toString()).toBe("123")
      expect(converter[1].toString()).toBe("85")
      expect(converter[2].toString()).toBe("0")
    })

    it("should parse to a SmartActuatorSingleChannel", () => {
      expect(converter[0].toSmartActuatorSingleChannel()).toEqual({
        ...converter[0].defaults.smartActuatorSingleChannel(),
        channel: 100,
      })
      expect(converter[1].toSmartActuatorSingleChannel()).toEqual({
        ...converter[1].defaults.smartActuatorSingleChannel(),
        channel: 85,
      })
      expect(converter[2].toSmartActuatorSingleChannel()).toEqual({
        ...converter[2].defaults.smartActuatorSingleChannel(),
        channel: 0,
      })
    })

    it("should parse to a SmartActuatorRGBW", () => {      
      expect(converter[0].toSmartActuatorRGBW()).toEqual({
        ...converter[0].defaults.smartActuatorRGBW(),
        white: 100,
      })
      expect(converter[1].toSmartActuatorRGBW()).toEqual({
        ...converter[1].defaults.smartActuatorRGBW(),
        white: 85,
      })
      expect(converter[2].toSmartActuatorRGBW()).toEqual({
        ...converter[2].defaults.smartActuatorRGBW(),
        white: 0,
      })
    })
  })
  

  
  describe("parse a boolean to different formats", async () => {
    let converter: VariableConverter[] = []

    beforeEach(() => {
      converter = []
      converter.push(new VariableConverter({ type: "boolean", value: true }))
      converter.push(new VariableConverter({ type: "boolean", value: false }))
    })

    it("should parse to a boolean", () => {
      expect(converter[0].toBoolean()).toBe(true)
      expect(converter[1].toBoolean()).toBe(false)
    })

    it("should parse to a number", () => {
      expect(converter[0].toNumber()).toBe(1)
      expect(converter[1].toNumber()).toBe(0)
    })

    it("should parse to a string", () => {
      expect(converter[0].toString()).toBe("true")
      expect(converter[1].toString()).toBe("false")
    })

    it("should parse to a SmartActuatorSingleChannel", () => {
      expect(converter[0].toSmartActuatorSingleChannel()).toEqual({
        ...converter[0].defaults.smartActuatorSingleChannel(),
        channel: 100,
      })
      expect(converter[1].toSmartActuatorSingleChannel()).toEqual({
        ...converter[1].defaults.smartActuatorSingleChannel(),
        channel: 0,
      })
    })

    it("should parse to a SmartActuatorRGBW", () => {      
      expect(converter[0].toSmartActuatorRGBW()).toEqual({
        ...converter[0].defaults.smartActuatorRGBW(),
        white: 100,
      })
      expect(converter[1].toSmartActuatorRGBW()).toEqual({
        ...converter[1].defaults.smartActuatorRGBW(),
        white: 0,
      })
    })
  })

  
  describe("parse a string to different formats", async () => {
    let converter: VariableConverter[] = []

    beforeEach(() => {
      converter = []
      converter.push(new VariableConverter({ type: "string", value: "85$" }))
      converter.push(new VariableConverter({ type: "string", value: "hello world" }))
      converter.push(new VariableConverter({ type: "string", value: "true" }))
      converter.push(new VariableConverter({ type: "string", value: "on" }))
    })

    it("should parse to a boolean", () => {
      expect(converter[0].toBoolean()).toBe(false)
      expect(converter[1].toBoolean()).toBe(false)
      expect(converter[2].toBoolean()).toBe(true)
      expect(converter[3].toBoolean()).toBe(true)
    })

    it("should parse to a number", () => {
      expect(converter[0].toNumber()).toBe(85)
      expect(converter[1].toNumber()).toBe(0)
      expect(converter[2].toNumber()).toBe(0)
      expect(converter[3].toNumber()).toBe(0)
    })

    it("should parse to a string", () => {
      expect(converter[0].toString()).toBe("85$")
      expect(converter[1].toString()).toBe("hello world")
      expect(converter[2].toString()).toBe("true")
      expect(converter[3].toString()).toBe("on")
    })

    it("should parse to a SmartActuatorSingleChannel", () => {
      expect(converter[0].toSmartActuatorSingleChannel()).toEqual({
        ...converter[0].defaults.smartActuatorSingleChannel(),
        channel: 85,
      })
      expect(converter[1].toSmartActuatorSingleChannel()).toEqual({
        ...converter[1].defaults.smartActuatorSingleChannel(),
        channel: 0,
      })
      expect(converter[2].toSmartActuatorSingleChannel()).toEqual({
        ...converter[2].defaults.smartActuatorSingleChannel(),
        channel: 0,
      })
      expect(converter[3].toSmartActuatorSingleChannel()).toEqual({
        ...converter[2].defaults.smartActuatorSingleChannel(),
        channel: 0,
      })
    })

    it("should parse to a SmartActuatorRGBW", () => {      
      expect(converter[0].toSmartActuatorRGBW()).toEqual({
        ...converter[0].defaults.smartActuatorRGBW(),
        white: 85,
      })
      expect(converter[1].toSmartActuatorRGBW()).toEqual({
        ...converter[1].defaults.smartActuatorRGBW(),
        white: 0,
      })
      expect(converter[2].toSmartActuatorRGBW()).toEqual({
        ...converter[2].defaults.smartActuatorRGBW(),
        white: 0,
      })
      expect(converter[3].toSmartActuatorRGBW()).toEqual({
        ...converter[2].defaults.smartActuatorRGBW(),
        white: 0,
      })
    })
  })



  describe("parse a SmartActuatorSingleChannel to different formats", async () => {
    let converter: VariableConverter[] = []

    beforeEach(() => {
      converter = []
      converter.push(new VariableConverter({ type: "SmartActuatorSingleChannel", value: { channel: 15, fadeTime: 3 } }))
      converter.push(new VariableConverter({ type: "SmartActuatorSingleChannel", value: { channel: 100, fadeTime: 2 } }))
      converter.push(new VariableConverter({ type: "SmartActuatorSingleChannel", value: { channel: 0, fadeTime: 1 } }))
    })

    it("should parse to a boolean", () => {
      expect(converter[0].toBoolean()).toBe(true)
      expect(converter[1].toBoolean()).toBe(true)
      expect(converter[2].toBoolean()).toBe(false)
    })

    it("should parse to a number", () => {
      expect(converter[0].toNumber()).toBe(15)
      expect(converter[1].toNumber()).toBe(100)
      expect(converter[2].toNumber()).toBe(0)
    })

    it("should parse to a string", () => {
      expect(converter[0].toString()).toBe("15% 3s")
      expect(converter[1].toString()).toBe("100% 2s")
      expect(converter[2].toString()).toBe("0% 1s")
    })

    it("should parse to a SmartActuatorSingleChannel", () => {
      expect(converter[0].toSmartActuatorSingleChannel()).toEqual({ fadeTime: 3, channel: 15 })
      expect(converter[1].toSmartActuatorSingleChannel()).toEqual({ fadeTime: 2, channel: 100 })
      expect(converter[2].toSmartActuatorSingleChannel()).toEqual({ fadeTime: 1, channel: 0 })
    })

    it("should parse to a SmartActuatorRGBW", () => {      
      expect(converter[0].toSmartActuatorRGBW()).toEqual({
        ...converter[0].defaults.smartActuatorRGBW(),
        white: 15,
        fadeTime: 3
      })
      expect(converter[1].toSmartActuatorRGBW()).toEqual({
        ...converter[1].defaults.smartActuatorRGBW(),
        white: 100,
        fadeTime: 2
      })
      expect(converter[2].toSmartActuatorRGBW()).toEqual({
        ...converter[2].defaults.smartActuatorRGBW(),
        white: 0,
        fadeTime: 1
      })
    })
  })



  describe("parse a SmartActautorRGBW to different formats", async () => {
    let converter: VariableConverter[] = []

    beforeEach(() => {
      converter = []
      converter.push(new VariableConverter({ type: "SmartActuatorRGBW", value: { red: 15, green: 100, blue: 0, white: 50, fadeTime: 3, bits: 0 } }))
      converter.push(new VariableConverter({ type: "SmartActuatorRGBW", value: { red: 0, green: 0, blue: 0, white: 0, fadeTime: 2, bits: 0 } }))
      converter.push(new VariableConverter({ type: "SmartActuatorRGBW", value: { red: 100, green: 100, blue: 100, white: 100, fadeTime: 1, bits: 0 } }))
    })

    it("should parse to a boolean", () => {
      expect(converter[0].toBoolean()).toBe(true)
      expect(converter[1].toBoolean()).toBe(false)
      expect(converter[2].toBoolean()).toBe(true)
    })

    it("should parse to a number", () => {
      expect(converter[0].toNumber()).toBe(0x26FF007F)
      expect(converter[1].toNumber()).toBe(0x0)
      expect(converter[2].toNumber()).toBe(0xFFFFFFFF)
    })

    it("should parse to a string", () => {
      expect(converter[0].toString()).toBe("#26ff007f 3s")
      expect(converter[1].toString()).toBe("#00000000 2s")
      expect(converter[2].toString()).toBe("#ffffffff 1s")
    })

    it("should parse to a SmartActuatorSingleChannel", () => {
      expect(converter[0].toSmartActuatorSingleChannel()).toEqual({ fadeTime: 3, channel: 41 })
      expect(converter[1].toSmartActuatorSingleChannel()).toEqual({ fadeTime: 2, channel: 0 })
      expect(converter[2].toSmartActuatorSingleChannel()).toEqual({ fadeTime: 1, channel: 100 })
    })

    it("should parse to a SmartActuatorRGBW", () => {      
      expect(converter[0].toSmartActuatorRGBW()).toEqual({ red: 15, green: 100, blue: 0, white: 50, fadeTime: 3, bits: 0 })
      expect(converter[1].toSmartActuatorRGBW()).toEqual({ red: 0, green: 0, blue: 0, white: 0, fadeTime: 2, bits: 0 })
      expect(converter[2].toSmartActuatorRGBW()).toEqual({ red: 100, green: 100, blue: 100, white: 100, fadeTime: 1, bits: 0 })
    })
  })

  
  describe("scaleNumber", async () => {
    it("should scale a new maximum value", () => {
      expect(VariableConverter.scaleNumber(50, 0, 100, 0, 255)).toBe(127.5)
      expect(VariableConverter.scaleNumber(10, 0, 100, 0, 255)).toBe(25.5)
      expect(VariableConverter.scaleNumber(20, 0, 100, 0, 255)).toBe(51)
    })
    it("should scale a new minimum", () => {
      expect(VariableConverter.scaleNumber(80, 0, 100, 0, 255)).toBe(204)
      expect(VariableConverter.scaleNumber(80, 0, 100, 25.5, 255)).toBe(209.1)
      expect(VariableConverter.scaleNumber(80, 0, 100, 50, 255)).toBe(214)
    })
  })
})