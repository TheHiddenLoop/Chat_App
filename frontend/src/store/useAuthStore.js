import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  isResettingPassword: false,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      
      if (!res.data.isVerified) {  
        set({ authUser: null });
        return;
      }
  
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      
      toast.success("Account created! Please verify your email.");
      return true; 
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      return false; 
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      
      if (!res.data.isVerified) {
        toast.error("Please verify your email before logging in.");
        return;
      }
  
      set({ authUser: res.data });  
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },
  
  verifyEmail: async (code) => {
    try {
      await axiosInstance.post("/auth/verify-email", { code });
      toast.success("Email verified successfully. You can now log in.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired verification code");
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  requestPasswordReset: async (email) => {
    set({ isResettingPassword: true });
    try {
      await axiosInstance.post("/auth/request-password-reset", { email });
      toast.success("Password reset link sent to your email");
      return true; 
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset email");
      return false; 
    } finally {
      set({ isResettingPassword: false });
    }
  },

  resetPassword: async (token, newPassword) => {
    set({ isResettingPassword: true });
  
    try {
      const response = await axiosInstance.put("/auth/reset-password", { token, newPassword });
      toast.success("Password reset successful. You can now log in.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Password reset failed");
    } finally {
      set({ isResettingPassword: false });
    }
  },
  
  
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
