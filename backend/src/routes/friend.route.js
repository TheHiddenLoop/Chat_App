import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, searchUsers, getFriendRequests, deleteFriend } from "../controllers/friend.controller.js";

const router = express.Router();

router.post("/send", protectRoute, sendFriendRequest);
router.post("/accept", protectRoute, acceptFriendRequest);
router.post("/reject", protectRoute, rejectFriendRequest);
router.get("/search", protectRoute, searchUsers);
router.get("/requests", protectRoute, getFriendRequests);
router.delete('/delete/:friendId', protectRoute, deleteFriend);

export default router;
