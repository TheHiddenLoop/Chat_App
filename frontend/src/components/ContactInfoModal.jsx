"use client"

import { useState } from "react"
import { X, BellOff, Ban, Trash, ArrowLeft, Share2 } from "lucide-react"
import { useAuthStore } from "../store/useAuthStore"
import { useChatStore } from "../store/useChatStore"
import { useFriendStore } from "../store/useFriendStore"
import toast from "react-hot-toast"

const ContactInfoModal = ({ isOpen, onClose, user }) => {
  const { authUser } = useAuthStore()
  const { messages = [] } = useChatStore()
  const { deleteFriend } = useFriendStore()
  const [selectedImage, setSelectedImage] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState("about")

  if (!isOpen || !user) return null

  const isBot = user?._id === "AI_BOT"
  const userName = isBot ? "AI Chatbot" : user?.fullName || "Unknown User"
  const userEmail = isBot ? "ai-bot@chat.com" : user?.email || "No email available"
  const userStatus = isBot || user?.isOnline ? "Online" : "Offline"
  const userAbout = user?.about || (isBot ? "AI Assistant powered by advanced language models" : "No about information")

  // Ensure messages is an array & filter only images related to the user
  const chatImages = Array.isArray(messages)
    ? messages
        .filter((msg) => msg.image && (msg.senderId === user._id || msg.receiverId === user._id))
        .map((msg) => msg.image)
    : []

  const handleDeleteFriend = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    try {
      await deleteFriend(user._id)
      onClose()
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error("Failed to delete friend:", error)
      toast.error("Failed to remove contact")
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-300"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-base-100 rounded-lg w-full h-full md:h-auto md:max-w-md md:mx-4 md:max-h-[85vh] flex flex-col shadow-xl animate-in slide-in-from-right duration-300 md:slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-base-300">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="md:hidden btn btn-sm btn-circle hover:bg-base-200">
              <ArrowLeft size={18} />
            </button>
            <h2 className="font-medium text-lg">Contact Info</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="hidden md:flex btn btn-sm btn-circle hover:bg-base-200">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <div className="flex flex-col items-center py-6">
            <div className="avatar relative group">
              <div
                className="w-24 h-24 rounded-full cursor-pointer border-4 border-base-200 shadow-md group-hover:border-primary transition-all duration-300"
                onClick={() => setSelectedImage(user?.profilePic || "/avatar.png")}
              >
                <img
                  src={user?.profilePic || "/avatar.png"}
                  alt={userName}
                  className="object-cover w-full h-full"
                  onError={(e) => (e.target.src = "/avatar.png")}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-primary text-primary-content rounded-full p-1.5 shadow-lg">
                  <Share2 size={14} />
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mt-4">{userName}</h3>
            <p className="text-base-content/70 flex items-center gap-1.5">
              {user?.isOnline && <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>}
              {userStatus}
            </p>
          </div>

          {/* Tabs */}
          <div className="px-4 border-b border-base-300">
            <div className="flex">
              <button
                onClick={() => setActiveTab("about")}
                className={`px-4 py-2.5 font-medium text-sm transition-colors relative ${
                  activeTab === "about" ? "text-primary" : "text-base-content/70 hover:text-base-content"
                }`}
              >
                About
                {activeTab === "about" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>}
              </button>
              <button
                onClick={() => setActiveTab("media")}
                className={`px-4 py-2.5 font-medium text-sm transition-colors relative ${
                  activeTab === "media" ? "text-primary" : "text-base-content/70 hover:text-base-content"
                }`}
              >
                Media
                {activeTab === "media" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>}
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            {activeTab === "about" && (
              <>
                {/* Email Section */}
                <div className="mb-4 bg-base-200/50 p-4 rounded-lg">
                  <h4 className="text-xs uppercase text-base-content/50 font-medium mb-1">EMAIL</h4>
                  <p className="text-sm font-medium">{userEmail}</p>
                </div>

                {/* About Section */}
                <div className="mb-6 bg-base-200/50 p-4 rounded-lg">
                  <h4 className="text-xs uppercase text-base-content/50 font-medium mb-1">ABOUT</h4>
                  <p className="text-sm">{userAbout}</p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 mt-6">
                  <button className="flex items-center gap-3 w-full p-3 hover:bg-base-200 rounded-lg transition-colors">
                    <BellOff size={18} className="text-base-content/70" />
                    <span className="text-sm">Mute notifications</span>
                  </button>

                  <button className="flex items-center gap-3 w-full p-3 hover:bg-base-200 rounded-lg transition-colors">
                    <Ban size={18} className="text-base-content/70" />
                    <span className="text-sm">Block</span>
                  </button>

                  {/* DELETE FRIEND BUTTON */}
                  <button
                    onClick={handleDeleteFriend}
                    className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${
                      showDeleteConfirm ? "bg-red-100 dark:bg-red-900/20" : "hover:bg-red-100 dark:hover:bg-red-900/20"
                    }`}
                  >
                    <Trash size={18} className="text-red-500" />
                    <span className="text-sm text-red-500">
                      {showDeleteConfirm ? "Confirm removal?" : "Remove from contacts"}
                    </span>
                    {showDeleteConfirm && (
  <span
    onClick={(e) => {
      e.stopPropagation()
      setShowDeleteConfirm(false)
    }}
    className="ml-auto text-xs text-base-content/70 hover:text-base-content cursor-pointer"
  >
    Cancel
  </span>
)}

                  </button>
                </div>
              </>
            )}

            {activeTab === "media" && (
              <>
                {/* Shared Images Section */}
                {chatImages.length > 0 ? (
                  <div className="mb-4">
                    <h4 className="text-xs uppercase text-base-content/50 font-medium mb-3">SHARED MEDIA</h4>
                    <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1">
                      {chatImages.map((img, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden cursor-pointer border border-base-300 hover:opacity-90 transition-opacity group relative"
                          onClick={() => setSelectedImage(img)}
                        >
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`Shared Image ${index + 1}`}
                            className="object-cover w-full h-full"
                            onError={(e) => (e.target.src = "/placeholder.png")}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs">View</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
                      <Share2 size={24} className="text-base-content/40" />
                    </div>
                    <p className="text-base-content/70 mb-1">No media shared yet</p>
                    <p className="text-xs text-base-content/50">Images shared in this chat will appear here</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Full-Screen Image Preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-[95vw] h-[80vh] md:w-[80vw] md:h-[80vh] flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedImage(null)
              }}
              className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <X size={24} />
            </button>
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Full View"
              className="object-contain w-full h-full rounded-lg max-h-[80vh] max-w-[95vw]"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactInfoModal
