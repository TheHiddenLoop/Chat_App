import { X, MoreVertical, Trash } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ContactInfoModal from "./ContactInfoModal";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, clearChatMessages } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactInfoOpen, setContactInfoOpen] = useState(false);
  const menuRef = useRef(null);

  if (!selectedUser) return null;

  // Check if the selected user is the bot
  const isBot = selectedUser._id === "AI_BOT";

  // Ensure bot has a proper name
  const userName = isBot ? "AI Chatbot" : selectedUser.fullName;

  // Check if user is online (Bot is always online)
  const isOnline =
    isBot || onlineUsers.some((user) => user._id === selectedUser._id || user === selectedUser._id);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Clear chat handler
  const handleClearChat = useCallback(async () => {
    try {
      await clearChatMessages();
      setMenuOpen(false);
    } catch (error) {
      console.error("Error clearing chat:", error);
      alert("Could not clear chat. Please try again.");
    }
  }, [clearChatMessages]);

  // Open contact info modal
  const handleOpenContactInfo = () => {
    setContactInfoOpen(true);
  };

  return (
    <>
      <div className="p-2.5 border-b border-base-300 bg-base-100 relative">
        <div className="flex items-center justify-between">
          {/* Left: User Info */}
          <div className="flex items-center gap-3">
            <div className="avatar cursor-pointer" onClick={handleOpenContactInfo}>
              <div className="size-10 rounded-full relative">
                <img src={selectedUser.profilePic || "/avatar.png"} alt={userName} />
              </div>
            </div>
            <div>
              <h3 className="font-medium">{userName}</h3>
              <p className="text-sm text-base-content/70">{isOnline ? "Online" : "Offline"}</p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!menuOpen)}>
                <MoreVertical />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-base-100 shadow-lg rounded-md border border-base-300 z-10">
                  <button
                    onClick={handleClearChat}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-base-200 text-sm"
                  >
                    <Trash size={16} /> Clear Chat
                  </button>
                </div>
              )}
            </div>
            <button onClick={() => setSelectedUser(null)}>
              <X />
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
  );
};

export default ChatHeader;
