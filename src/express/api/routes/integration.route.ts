import express from "express"
import { integrationController } from "../controllers/integration.controller"

const router = express.Router()

router.get("/integration/config", integrationController.config)
router.get("/integration", integrationController.all)
router.post("/integration", integrationController.createIntegration)
router.get("/integration/:id", integrationController.integration)
router.patch("/integration/:id", integrationController.updateIntegration)
router.delete("/integration/:id", integrationController.removeIntegration)
router.get("/integration/:id/tree", integrationController.getTree)
router.post("/integration/:id/variable", integrationController.createIntegrationVariable)
router.patch("/integration/:id/variable/:variableId", integrationController.updateIntegrationVariable)
router.delete("/integration/:id/variable/:variableId", integrationController.deleteIntegrationVariable)

export default router