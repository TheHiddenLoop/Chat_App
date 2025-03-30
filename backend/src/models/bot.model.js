import mongoose from "mongoose";

const botMessageSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true, index: true }, // Index for faster queries
    receiverId: { type: String, required: true, default: "AI_BOT" }, // Default AI bot ID
    message: { type: String, required: true, trim: true }, // Trim to remove unnecessary spaces
    reply: { type: String, required: true, trim: true }, 
  },
  { timestamps: true }
);

const BotMessage = mongoose.model("BotMessage", botMessageSchema);

export default BotMessage;
