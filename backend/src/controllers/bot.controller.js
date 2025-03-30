import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import BotMessage from "../models/bot.model.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const botId = "AI_BOT"; 

const getAIResponse = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent(text);

    const responseText = result.response.text();
    if (!responseText) throw new Error("AI response is empty.");

    return responseText;
  } catch (error) {
    console.error("AI Response Error:", error);
    return "Sorry, I am unable to respond at the moment.";
  }
};

export const chatWithBot = async (req, res) => {
  try {
    const { senderId, text } = req.body;

    if (!senderId || !text) {
      return res.status(400).json({ message: "Sender ID and message text are required" });
    }

    const botResponse = await getAIResponse(text);

    const userMessage = new BotMessage({
      senderId,
      receiverId: botId,
      message: text,
      reply: botResponse,  
      createdAt: new Date(),
    });

    const botMessage = new BotMessage({
      senderId: botId,
      receiverId: senderId,
      message: botResponse,
      reply: text,  
      createdAt: new Date(),
    });

    await userMessage.save();
    await botMessage.save();

    res.status(200).json({
      senderId,
      text,
      reply: botResponse,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Bot error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Fetch Bot Messages for a Specific User
export const getBotMessages = async (req, res) => {
  try {
    const { senderId } = req.params;

    if (!senderId) {
      return res.status(400).json({ error: "Sender ID is required." });
    }

    //Fetch messages for the given user
    const botMessages = await BotMessage.find({
      $or: [{ senderId, receiverId: botId }, { senderId: botId, receiverId: senderId }],
    })
      .sort({ createdAt: 1 }) 
      .select("-__v"); 

    res.json(botMessages);
  } catch (error) {
    console.error("Fetch Messages Error:", error);
    res.status(500).json({ error: "Failed to fetch bot messages." });
  }
};

export const clearBotChat = async (req, res) => {
  try {
    const { senderId } = req.body; // The user who chatted with the bot

    if (!senderId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    console.log(`Clearing bot chat for user: ${senderId}`);

    // Delete only messages between user and bot
    const result = await BotMessage.deleteMany({
      $or: [
        { senderId, receiverId: "AI_BOT" },
        { senderId: "AI_BOT", receiverId: senderId }
      ]
    });

    console.log(`Deleted bot messages: ${result.deletedCount}`);

    res.status(200).json({ message: "Bot chat cleared successfully" });
  } catch (error) {
    console.error("Error clearing bot chat:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

