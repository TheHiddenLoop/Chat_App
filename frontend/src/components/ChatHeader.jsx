"use client"

import { X, MoreVertical, Trash, Info } from "lucide-react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useAuthStore } from "../store/useAuthStore"
import { useChatStore } from "../store/useChatStore"
import ContactInfoModal from "./ContactInfoModal"

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, clearChatMessages } = useChatStore()
  const { onlineUsers } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [contactInfoOpen, setContactInfoOpen] = useState(false)
  const menuRef = useRef(null)

  // Close dropdown menu when clicking outside
  const handleClickOutside = useRef((event) => {}) // Initialize with an empty function

  useEffect(() => {
    handleClickOutside.current = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    const handleMouseDown = (event) => {
      handleClickOutside.current(event)
    }

    document.addEventListener("mousedown", handleMouseDown)
    return () => document.removeEventListener("mousedown", handleMouseDown)
  }, [menuOpen])

  if (!selectedUser) return null

  // Check if the selected user is the bot
  const isBot = selectedUser._id === "AI_BOT"

  // Ensure bot has a proper name
  const userName = isBot ? "AI Chatbot" : selectedUser.fullName

  // Check if user is online (Bot is always online)
  const isOnline = isBot || onlineUsers.some((user) => user._id === selectedUser._id || user === selectedUser._id)

  // Clear chat handler
  const handleClearChat = useCallback(async () => {
    try {
      await clearChatMessages()
      setMenuOpen(false)
    } catch (error) {
      console.error("Error clearing chat:", error)
      alert("Could not clear chat. Please try again.")
    }
  }, [clearChatMessages])

  // Open contact info modal
  const handleOpenContactInfo = useCallback(() => {
    setContactInfoOpen(true)
    setMenuOpen(false)
  }, [])

  return (
    <>
      <div className="p-2 sm:p-3 border-b border-base-300 bg-base-100 sticky top-0 left-0 right-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Left: User Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="avatar cursor-pointer group" onClick={handleOpenContactInfo}>
              <div className="size-10 sm:size-11 rounded-full relative border-2 border-base-300 group-hover:border-primary transition-colors">
                <img src={selectedUser.profilePic || "/avatar.png"} alt={userName} className="object-cover" />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-sm sm:text-base">{userName}</h3>
              <p className="text-xs sm:text-sm text-base-content/70">
                {isOnline ? <span className="flex items-center gap-1">Online</span> : "Offline"}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="btn btn-sm btn-circle hover:bg-base-200 transition-colors"
              >
                <MoreVertical size={16} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-base-100 shadow-lg rounded-md border border-base-300 z-20 animate-in slide-in-from-top-5 duration-200">
                  <button
                    onClick={handleOpenContactInfo}
                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-base-200 text-sm"
                  >
                    <Info size={16} /> Contact Info
                  </button>
                  <button
                    onClick={handleClearChat}
                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-base-200 text-sm text-red-500"
                  >
                    <Trash size={16} /> Clear Chat
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="btn btn-sm btn-circle hover:bg-base-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Contact Info Modal */}
      <ContactInfoModal
        isOpen={contactInfoOpen}
        onClose={() => setContactInfoOpen(false)}
        user={{ ...selectedUser, isOnline }}
      />
    </>
  )
}

export default ChatHeader
