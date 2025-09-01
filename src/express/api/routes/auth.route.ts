import express from "express"
import { authController } from "../controllers/auth.controller"

const router = express.Router()

router.post("/auth/login", authController.login)
router.get("/auth/whoami", authController.whoami)

export default router