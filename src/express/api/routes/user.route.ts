import express from "express"
import { userController } from "../controllers/user.controller"

const router = express.Router()

router.get("/users", userController.getAll)
router.post("/users", userController.create)
router.patch("/users/:userId", userController.update)
router.delete("/users/:userId", userController.delete)

export default router