"use client"

import Navbar from "./components/Navbar"

import HomePage from "./pages/HomePage"
import SignUpPage from "./pages/SignUpPage"
import LoginPage from "./pages/LoginPage"
import SettingsPage from "./pages/SettingsPage"
import ProfilePage from "./pages/ProfilePage"
import FriendPage from "./pages/FriendPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage" // Added
import ResetPasswordPage from "./pages/ResetPasswordPage" // Added

import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "./store/useAuthStore"
import { useChatStore } from "./store/useChatStore"
import { useThemeStore } from "./store/useThemeStore"
import { useEffect } from "react"
import EmailVerificationPage from "./pages/EmailVerificationPage"
import { Loader } from "lucide-react"
import { Toaster } from "react-hot-toast"
import useMobile from "./hooks/use-mobile"

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore()
  const { selectedUser } = useChatStore()
  const { theme } = useThemeStore()
  const isMobile = useMobile()
  const location = useLocation()

  // Only hide navbar on homepage when in mobile and chat is selected
  const shouldShowNavbar = !(isMobile && selectedUser && location.pathname === "/")

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    )

  return (
    <div data-theme={theme}>
      {shouldShowNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/friends" element={authUser ? <FriendPage /> : <Navigate to="/login" />} />

        {/* Added Forgot & Reset Password Routes */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App
