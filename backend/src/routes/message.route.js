import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage , clearChatForUser, deleteMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);


//changes
router.post("/clear-chat", protectRoute, clearChatForUser);
router.delete("/delete/:messageId", deleteMessage);


export default router;
