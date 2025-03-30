import mongoose from "mongoose";
import FriendRequest from "../models/friendRequest.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const sendFriendRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const senderId = req.user._id;

    const receiver = await User.findOne({ email });
    if (!receiver) return res.status(404).json({ message: "User not found" });

    if (receiver._id.equals(senderId)) {
      return res.status(400).json({ message: "You cannot send a friend request to yourself" });
    }

    const existingRequest = await FriendRequest.findOne({ sender: senderId, receiver: receiver._id });
    if (existingRequest) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const sender = await User.findById(senderId);
    if (sender.friends.includes(receiver._id)) {
      return res.status(400).json({ message: "You are already friends" });
    }

    const friendRequest = await FriendRequest.create({ sender: senderId, receiver: receiver._id });

    const receiverSocketId = getReceiverSocketId(receiver._id);
    if (receiverSocketId) io.to(receiverSocketId).emit("newFriendRequest", friendRequest);

    res.status(201).json({ message: "Friend request sent", friendRequest });
  } catch (error) {
    console.error("Error sending friend request:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await FriendRequest.find({ receiver: userId, status: "pending" })
      .populate("sender", "fullName email profilePic");

    res.json(requests);
  } catch (error) {
    console.error("Error fetching friend requests:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const request = await FriendRequest.findById(requestId).populate("sender receiver");
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "accepted";
    await request.save();

    const sender = await User.findById(request.sender._id);
    const receiver = await User.findById(request.receiver._id);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!sender.friends.includes(receiver._id)) sender.friends.push(receiver._id);
    if (!receiver.friends.includes(sender._id)) receiver.friends.push(sender._id);

    await sender.save();
    await receiver.save();

    const senderSocketId = getReceiverSocketId(sender._id);
    const receiverSocketId = getReceiverSocketId(receiver._id);

    if (senderSocketId) io.to(senderSocketId).emit("friendRequestAccepted", receiver);
    if (receiverSocketId) io.to(receiverSocketId).emit("friendRequestAccepted", sender);

    res.json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error accepting friend request:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    await request.deleteOne();

    res.json({ message: "Friend request rejected" });
  } catch (error) {
    console.error("Error rejecting friend request:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { email } = req.query;

    const users = await User.find({
      email: { $regex: email, $options: "i" },
      _id: { $ne: req.user._id },
    }).select("fullName email profilePic");

    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const deleteFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;

   
    await FriendRequest.deleteMany({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId },
      ],
    });

    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

    return res.status(200).json({ message: 'Friend removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to remove friend', error });
  }
};