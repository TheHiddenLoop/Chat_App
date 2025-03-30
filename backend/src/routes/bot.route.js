import express from "express";
import { chatWithBot, getBotMessages, clearBotChat } from "../controllers/bot.controller.js";

const router = express.Router();

router.post("/chat", chatWithBot);
router.get("/messages/:senderId", getBotMessages);
router.delete("/clear-bot-chat", clearBotChat);

export default router;
