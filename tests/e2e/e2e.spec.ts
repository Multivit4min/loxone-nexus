import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { AppService } from "../../src/core/app/AppService"
import { NexusApi } from "../__mocks__/api/NexusApi"
import { ApiError } from "../__mocks__/api/ApiError"
import { LoxoneServer } from "loxone-ici"

describe("E2E Test", () => {
  
  process.env.DATABASE_PATH = "file::memory:?cache=shared"
  let api = new NexusApi("http://localhost:8000")
  let app: AppService


  beforeAll(async () => {
    app = new AppService()
    await app.start()
  })


  afterAll(async () => {
    await app.stop()
  })


  describe("/api/setup", () => {
    it("should test if setup is enabled", async () => {
      const { setup } = await api.apiConfig()
      expect(setup).toBe(true)
    })

    it("should register for an account via setup", async () => {
      const { user, token } = await api.setup("admin", "foo123456")
      expect(user.id).toBe(1)
      expect(user.username).toBe("admin")
      expect(token).toBeTypeOf("string")
    })

    it("should validate that the setup route is not available anymore", async () => {
      await expect(api.setup("admin", "foo123456")).rejects.toThrowError(ApiError)
    })
  })


  describe("/api/auth", () => {
    it("should validate a failed login attempt", async () => {
      await expect(api.login("admin", "WRONG_PASSWORD")).rejects.toThrowError(ApiError)
    })

    it("should login and retrieve a token for the user", async () => {
      const { user, token } = await api.login("admin", "foo123456")
      expect(user.id).toBe(1)
      expect(user.username).toBe("admin")
      expect(token).toBeTypeOf("string")
    })
  })


  describe("/api/user", () => {
    it("should create a new user", async () => {
      const user = await api.createUser("test", "foobar")
      expect(user.id).toBe(2)
      expect(user.username).toBe("test")
      const users = await api.getUsers()
      expect(users.length).toBe(2)
    })

    it("should update a user", async () => {
      const user = await api.updateUser(2, { username: "test2" })
      expect(user.id).toBe(2)
      expect(user.username).toBe("test2")
    })

    it("should delete the user", async () => {
      await api.deleteUser(2)
      const users = await api.getUsers()
      expect(users.length).toBe(1)
    })
  })


  describe("/api/loxone", () => {

    const LISTEN_PORT = 8173

    it("should create a new loxone instance", async () => {
      const instance = await api.createLoxoneInstance({
        label: "test",
        host: "localhost",
        port: 8172,
        listenPort: LISTEN_PORT,
        remoteId: "mock",
        ownId: "vitest"
      })
      expect(instance.id).toBe(1)
      expect(instance.label).toBe("test")
      expect(instance.host).toBe("localhost")
      expect(instance.port).toBe(8172)
      expect(instance.listenPort).toBe(LISTEN_PORT)
      expect(instance.remoteId).toBe("mock")
      expect(instance.ownId).toBe("vitest")
      expect(instance.state).toBe(1)
      expect(instance.variables.length).toBe(0)
      expect(instance.additionalInputs.length).toBe(0)
    })

    it("should update the instance", async () => {
      const instance = await api.updateLoxoneInstance(1, { "label": "test2" })
      expect(instance.id).toBe(1)
      expect(instance.label).toBe("test2")
    })

    it("should start the loxone instance", async () => {
      await api.startLoxoneInstance(1)
      const instance = await api.getLoxoneInstance(1)
      expect(instance.id).toBe(1)
      expect(instance.state).toBe(4)
      expect(instance.active).toBe(true)
    })

    describe("/:id/variables", () => {
      let ici: LoxoneServer

      beforeAll(async () => {
        ici = new LoxoneServer({ ownId: "mock" })
        ici.bind(LISTEN_PORT)
      })

      afterAll(async () => {
        await ici.close()
      })

      it("should create a loxone variable", async () => {
        const variable = await api.createLoxoneVariable(1, {
          packetId: "test",
          type: 1,
          direction: "OUTPUT"
        })
        expect(variable)
        expect(variable.id).toBe(1)
        expect(variable.loxoneId).toBe(1)
        expect(variable.value.type).toBe("number")
        expect(variable.value.value).toBe(0)
        const instance = await api.getLoxoneInstance(1)
        expect(instance.id).toBe(1)
        expect(instance.variables.length).toBe(1)
      })

    })

    it("should stop the loxone instance", async () => {
      await api.stopLoxoneInstance(1)
      const instance = await api.getLoxoneInstance(1)
      expect(instance.id).toBe(1)
      expect(instance.state).toBe(1)
      expect(instance.active).toBe(false)
    })

    it("should delete the loxone instance", async () => {
      await api.deleteLoxoneInstance(1)
      const instances = await api.getLoxoneInstances()
      expect(instances.entries.length).toBe(0)
    })
  })
})