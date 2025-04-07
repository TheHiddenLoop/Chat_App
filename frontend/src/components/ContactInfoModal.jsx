"use client"

import { useState } from "react"
import { X, BellOff, Ban, Trash, AlertTriangle } from "lucide-react"
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
    try {
      await deleteFriend(user._id)
      toast.success(`Removed ${userName} from your contacts`)
      onClose()
    } catch (error) {
      console.error("Failed to delete friend:", error)
      toast.error("Failed to remove contact")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-base-100 rounded-lg w-full h-full sm:h-auto sm:max-w-md sm:mx-4 sm:max-h-[85vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-3 sm:p-4 flex items-center justify-between border-b border-base-300">
          <h2 className="font-medium text-lg">Contact Info</h2>
          <button onClick={onClose} className="btn btn-sm btn-circle hover:bg-base-200">
            <X size={18} />
          </button>
        </div>

        {/* Profile Section */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <div className="flex flex-col items-center py-4 sm:py-6">
            <div className="avatar relative">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full cursor-pointer border-4 border-base-200 shadow-md"
                onClick={() => setSelectedImage(user?.profilePic || "/avatar.png")}
              >
                <img
                  src={user?.profilePic || "/avatar.png"}
                  alt={userName}
                  className="object-cover w-full h-full"
                  onError={(e) => (e.target.src = "/avatar.png")}
                />
              </div>
              
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4">{userName}</h3>
            <p className="text-base-content/70 flex items-center gap-1">
              {user?.isOnline && <span className="rounded-full inline-block"></span>}
              {userStatus}
            </p>
          </div>

          <div className="px-4 sm:px-6 pb-6">
            {/* Email Section */}
            <div className="mb-3 sm:mb-4 bg-base-200 p-3 rounded-lg">
              <h4 className="text-xs uppercase text-base-content/50 font-medium mb-1">EMAIL</h4>
              <p className="text-sm font-medium">{userEmail}</p>
            </div>

            {/* About Section */}
            <div className="mb-4 sm:mb-6 bg-base-200 p-3 rounded-lg">
              <h4 className="text-xs uppercase text-base-content/50 font-medium mb-1">ABOUT</h4>
              <p className="text-sm">{userAbout}</p>
            </div>

            {/* Shared Images Section */}
            {chatImages.length > 0 ? (
              <div className="mb-4 sm:mb-6">
                <h4 className="text-xs uppercase text-base-content/50 font-medium mb-2">SHARED IMAGES</h4>
                <div className="grid grid-cols-3 gap-2 max-h-40 sm:max-h-52 overflow-y-auto pr-1">
                  {chatImages.map((img, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer border border-base-300 hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(img)}
                    >
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`Shared Image ${index + 1}`}
                        className="object-cover w-full h-full"
                        onError={(e) => (e.target.src = "/placeholder.png")}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-base-content/50 mb-4 sm:mb-6">No images shared yet.</p>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
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
                className="flex items-center gap-3 w-full p-2.5 hover:bg-red-100 rounded-lg text-red-500"
              >
                <Trash size={18} />
                <span className="text-sm">Delete Friend</span>
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Image Preview */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-[95vw] h-[80vh] sm:w-[80vw] sm:h-[80vh] flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
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

