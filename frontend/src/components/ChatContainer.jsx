import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import { X, Trash } from "lucide-react";

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const formatChatDate = (timestamp) => {
    const date = dayjs(timestamp);
    if (date.isToday()) return "Today";
    if (date.isYesterday()) return "Yesterday";
    return date.format("DD/MM/YYYY");
  };

  let lastMessageDate = null;

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isMessagesLoading ? (
          <MessageSkeleton />
        ) : messages.length === 0 ? (
          <p className="text-gray-500 text-center">No messages yet</p>
        ) : (
          messages.map((message, index) => {
            const messageDate = formatChatDate(message.createdAt);
            const showDateLabel = messageDate !== lastMessageDate;
            lastMessageDate = messageDate;

            return (
              <div key={message._id || `msg-${index}`}> 
                {showDateLabel && (
                  <div className="text-center text-gray-500 text-sm my-2">{messageDate}</div>
                )}
                <div
                  className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                  ref={messageEndRef}
                >
                  <div className="chat-image avatar">
                    <div className="size-10 rounded-full border">
                      <img
                        src={
                          message.senderId === authUser._id
                            ? authUser.profilePic || "/avatar.png"
                            : selectedUser.profilePic || "/avatar.png"
                        }
                        alt="profile pic"
                      />
                    </div>
                  </div>
                  <div className="chat-header mb-1 flex items-center space-x-2 group">
                    {message.senderId === authUser._id && (
                      <button
                        onClick={() => handleDeleteMessage(message._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-500 hover:text-red-500"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                    <time className="text-xs opacity-50 ml-1">
                      {dayjs(message.createdAt).format("hh:mm A")}
                    </time>
                  </div>
                  <div className="chat-bubble flex flex-col rounded-[10px]">
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="sm:max-w-[200px] rounded-md mb-2 cursor-pointer"
                        onClick={() => setSelectedImage(message.image)}
                      />
                    )}
                    {message.text && <p>{message.text}</p>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <MessageInput />

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

export default ChatContainer;
