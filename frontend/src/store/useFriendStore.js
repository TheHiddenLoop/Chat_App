import { create } from "zustand";
import { io } from "socket.io-client";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

const socket = io(import.meta.env.MODE === "development" ? "http://localhost:5001" : "", { withCredentials: true });

export const useFriendStore = create((set, get) => ({
  searchResults: [],
  friendRequests: [],
  sentRequests: [], // Store sent requests
  friendsList: [], // Store friends

  // Fetch friend requests
  fetchRequests: async () => {
    try {
      const res = await axiosInstance.get("/friends/requests");
      set({ friendRequests: res.data });
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      toast.error("Failed to fetch friend requests.");
    }
  },

  // Fetch sent requests
  fetchSentRequests: async () => {
    try {
      const res = await axiosInstance.get("/friends/sent-requests");
      set({ sentRequests: res.data });
    } catch (error) {
      console.error("Error fetching sent requests:", error);
    }
  },

  // Fetch friends list
  fetchFriends: async () => {
    try {
      const res = await axiosInstance.get("/friends/list");
      set({ friendsList: res.data });
    } catch (error) {
      console.error("Error fetching friends list:", error);
    }
  },

  // Search users by email
  searchUsers: async (email) => {
    try {
      const res = await axiosInstance.get(`/friends/search?email=${email}`);
      set({ searchResults: res.data || [] });
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users.");
      set({ searchResults: [] });
    }
  },

  // Send friend request
  sendRequest: async (email) => {
    const { sentRequests, friendsList } = get();

    if (friendsList.some((friend) => friend.email === email)) {
      toast.error("This user is already your friend!");
      return;
    }

    if (sentRequests.some((req) => req.receiver.email === email)) {
      toast.error("Friend request already sent!");
      return;
    }

    try {
      await axiosInstance.post("/friends/send", { email });
      set((state) => ({
        sentRequests: [...state.sentRequests, { receiver: { email } }],
      }));
      toast.success("Friend request sent!");
    } catch (error) {
      console.error("Error sending request:", error);
      toast.error("Failed to send friend request.");
    }
  },

  // Accept friend request
  acceptRequest: async (requestId) => {
    try {
      await axiosInstance.post("/friends/accept", { requestId });
      set((state) => ({
        friendRequests: state.friendRequests.filter((req) => req._id !== requestId),
      }));
      toast.success("Friend request accepted!");
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept friend request.");
    }
  },

  // Reject friend request
  rejectRequest: async (requestId) => {
    try {
      await axiosInstance.post("/friends/reject", { requestId });
      set((state) => ({
        friendRequests: state.friendRequests.filter((req) => req._id !== requestId),
        sentRequests: state.sentRequests.filter((req) => req.receiver.email !== requestId),
      }));
      toast.success("Friend request rejected!");
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject friend request.");
    }
  },

  // Delete friend
  deleteFriend: async (friendId) => {
    try {
      await axiosInstance.delete(`/friends/delete/${friendId}`);
      set((state) => ({
        friendsList: state.friendsList.filter((friend) => friend._id !== friendId),
      }));
      toast.success("Friend removed successfully!");
    } catch (error) {
      console.error("Error deleting friend:", error);
      toast.error("Failed to remove friend.");
    }
  },
}));

// WebSocket: Listen for friend requests
socket.on("newFriendRequest", (request) => {
  useFriendStore.setState((state) => ({
    friendRequests: [...state.friendRequests, request],
  }));
});

socket.on("friendRequestAccepted", (updatedUser) => {
  useFriendStore.setState((state) => ({
    friendRequests: state.friendRequests.filter((req) => req.sender._id !== updatedUser._id),
  }));
});

// WebSocket: Listen for friend removal in real-time
socket.on("friendRemoved", (friendId) => {
  useFriendStore.setState((state) => ({
    friendsList: state.friendsList.filter((friend) => friend._id !== friendId),
  }));
});
