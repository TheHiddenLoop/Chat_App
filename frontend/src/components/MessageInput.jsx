"use client"

import { useRef, useState, useEffect } from "react"
import { useChatStore } from "../store/useChatStore"
import { Send, X, Smile, Paperclip } from "lucide-react"
import toast from "react-hot-toast"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"

const MessageInput = () => {
  const [text, setText] = useState("")
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)
  const emojiPickerRef = useRef(null)
  const textInputRef = useRef(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const { sendMessage, selectedUser } = useChatStore()
  const [isSending, setIsSending] = useState(false)

  // Focus input when selected user changes
  useEffect(() => {
    if (selectedUser && textInputRef.current) {
      textInputRef.current.focus()
    }
  }, [selectedUser])

  // Handle Image Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file?.type?.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  // Remove Selected Image
  const removeImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Send Message Handler
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if ((!text.trim() && !imagePreview) || isSending) return

    // Save current text/image to local vars
    const messageToSend = text.trim()
    const imageToSend = imagePreview

    // Clear the input & image immediately
    setText("")
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""

    setIsSending(true)

    try {
      await sendMessage({
        text: messageToSend,
        image: imageToSend,
      })

      // Focus back on input after sending
      if (textInputRef.current) {
        textInputRef.current.focus()
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message.")
    } finally {
      setIsSending(false)
    }
  }

  // Handle Emoji Selection
  const addEmoji = (emoji) => {
    setText((prev) => prev + emoji.native)
    if (textInputRef.current) {
      textInputRef.current.focus()
    }
  }

  // Close Emoji Picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showEmojiPicker])

  return (
    <div className="relative p-2 sm:p-4 w-full bg-base-100 border-t border-base-300">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-20 left-0 right-0 mx-auto sm:left-5 sm:mx-0 z-50 shadow-xl rounded-lg max-w-[90vw] sm:max-w-md"
          style={{ height: "250px", overflowY: "auto" }}
        >
          <Picker data={data} onEmojiSelect={addEmoji} previewPosition="none" skinTonePosition="none" />
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Preview"
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-base-300 shadow-sm"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center hover:bg-base-content hover:text-base-100 transition-colors"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input Field & Buttons */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-1 sm:gap-2 items-center">
          <input
            type="text"
            className="w-full input input-bordered rounded-full h-10 sm:h-12 px-3 sm:px-4 text-sm sm:text-base focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            placeholder={`Message ${selectedUser?.fullName || ""}...`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            ref={textInputRef}
          />
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />

          {/* Emoji Picker Button */}
          <button
            type="button"
            className="btn btn-circle btn-sm text-base-content/70 hover:bg-base-200 transition-colors"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={18} />
          </button>

          {/* Image Upload Button */}
          <button
            type="button"
            className={`btn btn-circle btn-sm ${
              imagePreview ? "text-primary" : "text-base-content/70"
            } hover:bg-base-200 transition-colors`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={18} className={imagePreview ? "rotate-45" : ""} />
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          className={`btn btn-circle btn-sm sm:btn-md ${(!text.trim() && !imagePreview) || isSending ? "btn-disabled" : "btn-primary text-primary-content"}`}
          disabled={(!text.trim() && !imagePreview) || isSending}
        >
          <Send size={16} className="sm:size-18" />
        </button>
      </form>
    </div>
  )
}

export default MessageInput

