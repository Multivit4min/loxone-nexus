import express from "express"
import { configController } from "../controllers/config.controller"

const router = express.Router()

router.get("/config", configController.getConfig)

export default router