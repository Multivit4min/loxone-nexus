import express from "express"
import { authController } from "../controllers/auth.controller"
import rateLimit from "express-rate-limit"

const limiter = rateLimit({
	windowMs: 5 * 60 * 1000,
	limit: 10,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	ipv6Subnet: 56,
})

const router = express.Router()

router.post("/auth/login", limiter, authController.login)
router.get("/auth/whoami", authController.whoami)

export default router