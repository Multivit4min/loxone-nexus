import express from "express"
import { loxoneController } from "../controllers/loxone.controller"

const router = express.Router()

router.get("/loxone", loxoneController.all)
router.post("/loxone", loxoneController.createInstance)
router.get("/loxone/:id", loxoneController.instance)
router.patch("/loxone/:id", loxoneController.updateInstance)
router.delete("/loxone/:id", loxoneController.removeInstance)
router.patch("/loxone/:id/start", loxoneController.start)
router.patch("/loxone/:id/stop", loxoneController.stop)
router.post("/loxone/:id/variables", loxoneController.createVariable)
router.delete("/loxone/:id/variables/:variableId", loxoneController.deleteVariable)
router.patch("/loxone/:id/variables/:variableId", loxoneController.updateVariable)
router.patch("/loxone/:id/variables/:variableId/force", loxoneController.forceVariable)
router.delete("/loxone/:id/variables/:variableId/force", loxoneController.unforceVariable)

export default router