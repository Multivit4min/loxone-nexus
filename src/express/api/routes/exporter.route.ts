import express from "express"
import { exportController } from "../controllers/export.controller"

const router = express.Router()

router.post("/export", exportController.create)
router.post("/export/upload", exportController.upload)

export default router