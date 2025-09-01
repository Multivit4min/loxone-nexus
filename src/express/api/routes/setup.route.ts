import express from "express"
import { setupController } from "../controllers/setup.controller"

const router = express.Router()

router.post("/setup", setupController.requiresSetup, setupController.setup)

export default router