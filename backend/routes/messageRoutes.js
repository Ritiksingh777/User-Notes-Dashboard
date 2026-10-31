import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  getMessages,
  createMessage,
  updateMessage,
  deleteMessage,
} from "../controllers/messageController.js";

const router = Router();

router.use(authenticateToken);

router.get("/", getMessages);
router.post("/", createMessage);
router.put("/:id", updateMessage);
router.delete("/:id", deleteMessage);

export default router;