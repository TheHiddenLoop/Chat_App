import { useState } from "react";
import { X, BellOff, Ban, Trash } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useFriendStore } from "../store/useFriendStore";

const ContactInfoModal = ({ isOpen, onClose, user }) => {
  const { authUser } = useAuthStore();
  const { messages = [] } = useChatStore(); // ✅ Ensure messages is always an array
  const { deleteFriend } = useFriendStore();
  const [selectedImage, setSelectedImage] = useState(null);

  if (!isOpen || !user) return null;

  const isBot = user?._id === "AI_BOT";
  const userName = isBot ? "AI Chatbot" : user?.fullName || "Unknown User";
  const userEmail = isBot ? "ai-bot@chat.com" : user?.email || "No email available";
  const userStatus = isBot || user?.isOnline ? "Online" : "Offline";
  const userAbout = user?.about || (isBot ? "AI Assistant powered by advanced language models" : "No about information");

  // ✅ Ensure messages is an array & filter only images related to the user
  const chatImages = Array.isArray(messages)
    ? messages
        .filter((msg) => msg.image && (msg.senderId === user._id || msg.receiverId === user._id))
        .map((msg) => msg.image)
    : [];

  const handleDeleteFriend = async () => {
    try {
      await deleteFriend(user._id);
      onClose();
    } catch (error) {
      console.error("Failed to delete friend:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-base-100 mt-8 rounded-lg w-full max-w-md mx-4 max-h-[81vh] flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-base-300">
          <h2 className="font-medium text-lg">Contact Info</h2>
          <button onClick={onClose} className="hover:bg-base-200 p-1 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Profile Section */}
        <div className="overflow-y-auto">
          <div className="flex flex-col items-center py-6">
            <div className="avatar relative">
              <div
                className="w-20 h-20 rounded-full cursor-pointer"
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
            <h3 className="text-xl font-semibold mt-4">{userName}</h3>
            <p className="text-base-content/70">{userStatus}</p>
          </div>

          <div className="px-6 pb-6">
            {/* Email Section */}
            <div className="mb-4">
              <h4 className="text-xs uppercase text-base-content/50 font-medium mb-2">EMAIL</h4>
              <p className="text-sm">{userEmail}</p>
            </div>

            {/* About Section */}
            <div className="mb-4">
              <h4 className="text-xs uppercase text-base-content/50 font-medium mb-2">ABOUT</h4>
              <p className="text-sm">{userAbout}</p>
            </div>

            {/* Shared Images Section */}
            {chatImages.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-xs uppercase text-base-content/50 font-medium mb-2">SHARED IMAGES</h4>
                <div className="grid grid-cols-3 gap-1 max-h-52 overflow-y-scroll ml-9" style={{ scrollbarWidth: "none" }}>
                  {chatImages.map((img, index) => (
                    <div
                      key={index}
                      className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => setSelectedImage(img)}
                    >
                      <img
                        src={img}
                        alt={`Shared Image ${index + 1}`}
                        className="object-cover w-full h-full"
                        onError={(e) => (e.target.src = "/placeholder.png")}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No images shared yet.</p>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="flex items-center gap-3 w-full p-2.5 hover:bg-base-200 rounded-lg">
                <BellOff size={18} className="text-base-content/70" />
                <span className="text-sm">Mute notifications</span>
              </button>

              <button className="flex items-center gap-3 w-full p-2.5 hover:bg-base-200 rounded-lg">
                <Ban size={18} className="text-base-content/70" />
                <span className="text-sm">Block</span>
              </button>

              {/* ✅ DELETE FRIEND BUTTON (No Confirmation) */}
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative w-[50vw] h-[50vh] flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 text-white bg-black/50 p-2 rounded-full"
            >
              <X size={24} />
            </button>
            <img src={selectedImage} alt="Full View" className="object-contain w-full h-full rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactInfoModal;
