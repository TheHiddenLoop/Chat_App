import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
  
      const botUser = {
        _id: "AI_BOT",
        name: "AI Assistant",
        profilePic: "/bot-avatar.png",
        isOnline:true,
      };
  
      const uniqueUsers = [botUser, ...res.data].reduce((acc, user) => {
        acc.set(user._id, user);
        return acc;
      }, new Map());
  
      set({ users: Array.from(uniqueUsers.values()) });
  
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users.");
    } finally {
      set({ isUsersLoading: false });
    }
  },
  

  getMessages: async (userId) => {
    if (!userId) {
      toast.error("No user selected.");
      return;
    }

    set({ isMessagesLoading: true });

    try {
      let res;
      if (userId === "AI_BOT") {
        res = await axiosInstance.get(
          `/bot/messages/${useAuthStore.getState().authUser._id}`
        );
      } else {
        res = await axiosInstance.get(`/messages/${userId}`);
      }

      let messages = res.data || [];

      messages = messages.map((m) => ({
        ...m,
        text: m.text || m.message, 
      }));

      const sortedMessages = messages.sort(
        (a, b) => new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0)
      );

      set({ messages: sortedMessages });
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error(
        error.response?.data?.message || "Failed to load messages."
      );
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // SEND MESSAGES
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const authUser = useAuthStore.getState().authUser; 

    if (!selectedUser) {
      toast.error("No user selected.");
      return;
    }

    try {
      let res;

      if (selectedUser._id === "AI_BOT") {
        const userMessage = {
          _id: `user_${new Date().toISOString()}`,
          senderId: authUser._id,  
          receiverId: "AI_BOT",
          text: messageData.text,   
          createdAt: new Date().toISOString(),
        };

        set({ messages: [...messages, userMessage] });

        res = await axiosInstance.post("/bot/chat", {
          senderId: authUser._id,
          text: messageData.text,
        });

        if (!res.data.reply || res.data.reply.trim() === "") {
          toast.error("AI Bot sent an empty response.");
          return;
        }

        const botReply = {
          _id: `bot_${new Date().toISOString()}`,
          senderId: "AI_BOT",
          receiverId: authUser._id,
          text: res.data.reply,    
          createdAt: new Date().toISOString(),
        };

        set({ messages: [...get().messages, botReply] });

      } else {
        res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, {
          ...messageData,
          senderId: authUser._id,
        });

        set({ messages: [...messages, res.data] });

        const socket = useAuthStore.getState().socket;
        socket.emit("sendMessage", res.data);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message.");
    }
  },

    // Clear Chat
    clearChatMessages: async () => {
      const { selectedUser } = get();
      const authUser = useAuthStore.getState().authUser;
    
      if (!selectedUser || !authUser) {
        toast.error("Error: No user selected or not authenticated.");
        return;
      }
    
      try {
        if (selectedUser._id === "AI_BOT") {
          await axiosInstance.delete("/bot/clear-bot-chat", {
            data: { senderId: authUser._id }, 
          });
        } else {

          await axiosInstance.post("/messages/clear-chat", {
            userId: authUser._id,
            chatUserId: selectedUser._id,
          });
        }
    
        set({ messages: [] }); 
        toast.success("Chat cleared!");
      } catch (error) {
        console.error("Error clearing chat:", error);
        toast.error("Failed to clear chat.");
      }
    },
    //message delete 
    deleteMessage: async (messageId) => {
      const { messages } = get();
      const authUser = useAuthStore.getState().authUser;
      const socket = useAuthStore.getState().socket;
      
      if (!messageId || !authUser) {
        toast.error("Invalid request");
        return;
      }
    
      try {

        await axiosInstance.delete(`/messages/delete/${messageId}`);
    
        set({ messages: messages.filter((msg) => msg._id !== messageId) });
    
        if (socket) {
          socket.emit("deleteMessage", messageId);
        }
    
        toast.success("Message deleted");
      } catch (error) {
        console.error("Error deleting message:", error);
        toast.error("Failed to delete message");
      }
    },

  // REAL-TIME SUBSCRIPTION
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {

      if (!newMessage.text && newMessage.message) {
        newMessage.text = newMessage.message;
      }

      if (
        newMessage.senderId === selectedUser._id ||
        newMessage.receiverId === selectedUser._id
      ) {
        set({ messages: [...get().messages, newMessage] });
      }
    });
    socket.on("deleteMessage", (messageId) => {
      set({ messages: get().messages.filter((msg) => msg._id !== messageId) });
    });

    socket.on("botMessage", (botMessage) => {
      if (!botMessage.text && botMessage.message) {
        botMessage.text = botMessage.message;
      }

      set((state) => ({
        messages: [...state.messages, botMessage],
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("botMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
