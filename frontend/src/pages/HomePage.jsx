"use client"

import { useChatStore } from "../store/useChatStore"
import { useEffect, useState } from "react"
import Sidebar from "../components/Sidebar"
import NoChatSelected from "../components/NoChatSelected"
import ChatContainer from "../components/ChatContainer"

const HomePage = () => {
  const { selectedUser, setSelectedUser } = useChatStore()
  const [isMobile, setIsMobile] = useState(false)

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile)

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-16 px-0 sm:pt-20 sm:px-4">
        <div className="bg-base-100 rounded-none sm:rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-4rem)] sm:h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-none sm:rounded-lg overflow-hidden">
            {/* On mobile: Show sidebar if no chat is selected, otherwise show chat */}
            {isMobile ? (
              selectedUser ? (
                <ChatContainer />
              ) : (
                <Sidebar />
              )
            ) : (
              <>
                <Sidebar />
                {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage

