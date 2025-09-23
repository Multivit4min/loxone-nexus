import express from "express"
import { powerController } from "../controllers/power.controller"

const router = express.Router()

router.post("/restart", powerController.restart)

export default router