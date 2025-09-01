import express from "express"
import { linkController } from "../controllers/link.controller"

const router = express.Router()

router.post("/link", linkController.createLink)
router.delete("/link/:integrationVariable/:loxoneVariable", linkController.removeLink)

export default router