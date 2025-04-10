"use client";

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
  const chatContainerRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [
    selectedUser?._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

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
    <div
      className="flex flex-col bg-gradient-to-b from-base-100 to-base-200"
      style={{ minHeight: "100dvh" }}
    >
      <ChatHeader />

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent"
      >
        {isMessagesLoading ? (
          <MessageSkeleton />
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-4 sm:p-6 rounded-xl bg-base-100 shadow-sm border border-base-300 max-w-[90%]">
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const messageDate = formatChatDate(message.createdAt);
            const showDateLabel = messageDate !== lastMessageDate;
            lastMessageDate = messageDate;
            const isAuthUserMessage = message.senderId === authUser._id;

            return (
              <div key={message._id || `msg-${index}`}>
                {showDateLabel && (
                  <div className="flex items-center justify-center my-3">
                    <div className="px-3 py-1 rounded-full bg-base-300 text-xs font-medium">
                      {messageDate}
                    </div>
                  </div>
                )}
                <div
                  className={`chat ${
                    isAuthUserMessage ? "chat-end" : "chat-start"
                  }`}
                  ref={index === messages.length - 1 ? messageEndRef : null}
                >
                  <div className="chat-image avatar">
                    <div className="size-8 sm:size-10 rounded-full border shadow-sm">
                      <img
                        src={
                          isAuthUserMessage
                            ? authUser.profilePic || "/avatar.png"
                            : selectedUser.profilePic || "/avatar.png"
                        }
                        alt="profile pic"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="chat-header mb-1 flex items-center space-x-2 group">
                    {isAuthUserMessage && (
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
                  <div
                    className={`chat-bubble flex flex-col items-start gap-2 p-2 rounded-[16px] shadow-sm
                      max-w-[85vw] sm:max-w-md
                      ${
                        isAuthUserMessage
                          ? "bg-primary text-primary-content"
                          : "bg-base-100 text-base-content border border-base-300"
                      }
                    `}
                  >
                    {message.image && (
                      <div className="rounded-md overflow-hidden self-start">
                        <img
                          src={message.image || "/placeholder.svg"}
                          alt="Attachment"
                          className="w-[130px] h-[200px] sm:w-[200px] sm:h-[250px] object-cover rounded-md cursor-pointer"
                          onClick={() => setSelectedImage(message.image)}
                        />
                      </div>
                    )}
                    {message.text && (
                      <div
                        className={`${
                          message.image
                            ? "mt-2 w-[130px] sm:w-[200px]"
                            : "w-full max-w-[85vw] sm:max-w-md"
                        }`}
                      >
                        <p className="break-words w-full">{message.text}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <MessageInput />

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
  );
};

export default ChatContainer;
