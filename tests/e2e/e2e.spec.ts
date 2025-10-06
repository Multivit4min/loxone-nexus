import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { AppService } from "../../src/core/app/AppService"
import { NexusApi } from "../__mocks__/api/NexusApi"
import { ApiError } from "../__mocks__/api/ApiError"
import { DATA_TYPE, LoxoneRemoteSystem, LoxoneServer } from "loxone-ici"

const sleep = (time: number) => {
  return new Promise<void>(fulfill => setTimeout(fulfill, time))
}

describe("E2E Test", () => {
  
  process.env.DATABASE_PATH = "file::memory:?cache=shared"
  let api = new NexusApi("http://localhost:8000")
  let app: AppService
  let ici: LoxoneServer
  let remote: LoxoneRemoteSystem
  const REMOTE_PORT = 8172
  const LISTEN_PORT = 8173

  beforeAll(async () => {
    app = new AppService()
    await app.start()
    ici = new LoxoneServer({ ownId: "mock" })
    await ici.bind(REMOTE_PORT)
    remote = ici.createRemoteSystem({
      address: "localhost",
      port: LISTEN_PORT,
      remoteId: "vitest"
    })
  })


  afterAll(async () => {
    await app.stop()
    await ici.close()
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

    it("should try to access a route without having permissions", async () => {
      api.clearCredentials()
      await expect(api.getLoxoneInstances()).rejects.toThrowError(Error)
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

    const INPUT_PACKET_ID = "itest"

    it("should create a new loxone instance", async () => {
      const instance = await api.createLoxoneInstance({
        label: "test",
        host: "localhost",
        port: REMOTE_PORT,
        listenPort: LISTEN_PORT,
        remoteId: "mock",
        ownId: "vitest"
      })
      expect(instance.id).toBe(1)
      expect(instance.label).toBe("test")
      expect(instance.host).toBe("localhost")
      expect(instance.port).toBe(REMOTE_PORT)
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
      const instance = await api.startLoxoneInstance(1)
      expect(instance.id).toBe(1)
      expect(instance.state).toBe(4)
      expect(instance.active).toBe(true)
    })

    describe("/:id/variables", () => {

      it("should create a loxone variable", async () => {
        const variable = await api.createLoxoneVariable(1, {
          packetId: INPUT_PACKET_ID,
          type: 1,
          direction: "INPUT"
        })
        expect(variable)
        expect(variable.id).toBe(1)
        expect(variable.loxoneId).toBe(1)
        expect(variable.direction).toBe("INPUT")
        expect(variable.value.type).toBe("number")
        expect(variable.value.value).toBe(0)
        const instance = await api.getLoxoneInstance(1)
        expect(instance.id).toBe(1)
        expect(instance.variables.length).toBe(1)
      })

      it("should validate an updated loxone variable", async () => {
        const variable = await api.updateLoxoneVariable(1, 1, { label: "foo" })
        expect(variable.id).toBe(1)
        expect(variable.loxoneId).toBe(1)
        expect(variable.label).toBe("foo")
      })

      it("should validate an updated loxone variable value", async () => {
        remote.sendOnce(INPUT_PACKET_ID, DATA_TYPE.ANALOG).setValue(4).send()
        await sleep(100)
        const resA = await api.getLoxoneInstance(1)
        expect(resA.variables[0].value.value).toBe(4)
        remote.sendOnce(INPUT_PACKET_ID, DATA_TYPE.ANALOG).setValue(6).send()
        await sleep(100)
        const resB = await api.getLoxoneInstance(1)
        expect(resB.variables[0].value.value).toBe(6)
      }, 1000)

      it("should delete the loxone variable", async () => {
        const instance = await api.deleteLoxoneVariable(1, 1)
        expect(instance.id).toBe(1)
        expect(instance.variables.length).toBe(0)
      })
    })

  })



  describe("/api/integration", () => {
    
    it("should create a new integration", async () => {
      expect(await api.getIntegrations()).toEqual([])
      const integration = await api.createIntegration({ 
        label: "webhook test",
        type: "Webhook"
      })
      expect(integration.id).toBe(1)
      expect(integration.label).toBe("webhook test")
      expect(integration.type).toBe("Webhook")

      expect((await api.getIntegrations()).length).toBe(1)
    })
    
    it("should update the created integration", async () => {
      const integration = await api.updateIntegration(1, { label: "webhook test2", config: {} })
      expect(integration.id).toBe(1)
      expect(integration.label).toBe("webhook test2")
      expect(integration.type).toBe("Webhook")
      expect((await api.getIntegrations()).length).toBe(1)
    })


    describe("/:id/variables", () => {

      type WebhookActionProps = {
        action: "hook",
        routeName: string
        duration: number
        token?: string
      }

      it("should create a integration variable", async () => {
        const variable = await api.createIntegrationVariable<WebhookActionProps>(1, {
          label: "testing webhook",
          direction: "OUTPUT",
          props: {
            action: "hook",
            routeName: "testing",
            duration: 1000
          }
        })
        expect(variable.id).toBe(1)
        expect(variable.integrationId).toBe(1)
        expect(variable.direction).toBe("OUTPUT")
        expect(variable.label).toBe("testing webhook")
      })

      it("should delete the integration variable", async () => {
        const integration = await api.deleteIntegrationVariable(1, 1)
        expect(integration.id).toBe(1)
        expect(integration.variables.length).toBe(0)
      })

    })

  })

  
  describe("/api/link", () => {
    
    const PACKET_ID = "linked"

    it("should create a link between 2 variables", async () => {       
      const { id: loxoneVariable } = await api.createLoxoneVariable(1, {
        packetId: PACKET_ID,
        type: DATA_TYPE.DIGITAL,
        direction: "OUTPUT"
      })
      const { id: integrationVariable } = await api.createIntegrationVariable(1, {
        label: "linked",
        direction: "INPUT",
        props: {
          action: "hook",
          routeName: "testing",
          duration: 5000
        }
      })
      const res = await api.createLink({ integrationVariable, loxoneVariable })
      const instance = await api.getLoxoneInstance(1)
      expect(res.id).toBe(1)
      expect(res.integrationVariable.id).toBe(integrationVariable)
      expect(res.loxoneVariable.id).toBe(loxoneVariable)
      expect(instance.variables.length).toBe(1)
      expect(instance.variables[0].links.length).toBe(1)
      expect(instance.variables[0].links[0].id).toBe(1)
    })

    it("should validate a change on the output of the loxone Variable", async () => {
      expect.assertions(4)
      const listener = ({ packet }: { packet: any }) => {
        if (packet.packetId === PACKET_ID) {
          expect(packet.type).toBe(DATA_TYPE.DIGITAL)
          expect(packet.payload.value).toBe(true)
          ici.removeListener("input", listener)
        }
      }
      ici.on("input", listener)
      await api.callPublicIntegrationHook(1, `testing`).get()
      const { variables } = await api.getLoxoneInstance(1)
      expect(variables.length).toBe(1)
      expect(variables[0].value.value).toBe(true)
    })

    it("should remove a link between 2 variables", async () => {
      await api.removeLink(1)
      const instance = await api.getLoxoneInstance(1)
      expect(instance.variables[0].links.length).toBe(0)
    })

  })

  describe("/api/integration", () => {

    it("should delete the integration", async () => {
      await api.deleteIntegration(1)
      expect(await api.getIntegrations()).toEqual([])
    })
  
  })

  describe("/api/loxone", () => {
    
    it("should stop the loxone instance", async () => {
      const instance = await api.stopLoxoneInstance(1)
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