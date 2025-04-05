"use client"

import { useEffect, useState } from "react"
import { useChatStore } from "../store/useChatStore"
import { useAuthStore } from "../store/useAuthStore"
import SidebarSkeleton from "./skeletons/SidebarSkeleton"
import { Search, X } from "lucide-react"
import { useThemeStore } from "../store/useThemeStore"

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore()
  const { onlineUsers } = useAuthStore()
  const { theme } = useThemeStore()

  const [showOnlineOnly, setShowOnlineOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    getUsers()
  }, [getUsers])

  // Filter users based on online status and search query
  const filteredUsers = users.filter((user) => {
    // First check online filter
    if (showOnlineOnly && !onlineUsers.includes(user._id) && user._id !== "AI_BOT") {
      return false
    }

    // Then check search query
    if (searchQuery) {
      const name = user.fullName || user.name || ""
      return name.toLowerCase().includes(searchQuery.toLowerCase())
    }

    return true
  })

  if (isUsersLoading) return <SidebarSkeleton />

  return (
    <aside
      className={`h-full w-full md:w-80 border-r flex flex-col transition-all duration-200 ${
        theme === "dark" ? "bg-neutral border-neutral-focus" : "bg-base-100 border-base-300"
      }`}
    >
      <div className={`border-b w-full p-3 ${theme === "dark" ? "border-neutral-focus" : "border-base-300"}`}>
        {/* Search Bar */}
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="  pl-10 sm:pl-9  w-full input input-bordered rounded-full h-10 sm:h-12 px-3 sm:px-4 text-sm sm:text-base focus:border-primary focus:ring-1 focus:ring-primary transition-all"

            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-base-content/50"
              >
                <X size={16} />
              </button>
            ) : (
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
            )}
          </div>
        </div>

        
      </div>

      <div className="overflow-y-auto w-full py-1 flex-1">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const isOnline = onlineUsers.includes(user._id) || user._id === "AI_BOT"
            const isSelected = selectedUser?._id === user._id

            return (
              <button
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`
                  w-full p-3 flex items-center gap-3 transition-all duration-200
                  ${
                    theme === "dark"
                      ? `hover:bg-neutral-focus ${isSelected ? "bg-neutral-focus" : ""}`
                      : `hover:bg-base-200 ${isSelected ? "bg-base-200" : ""}`
                  }
                  ${
                    isSelected
                      ? theme === "dark"
                        ? "border-l-4 border-pink-500"
                        : "border-l-4 border-primary"
                      : "border-l-4 border-transparent"
                  }
                `}
              >
                {/* Avatar */}
                <div className="relative">
                  <div
                    className={`size-12 rounded-full overflow-hidden border-2 ${
                      isSelected
                        ? theme === "dark"
                          ? "border-pink-500"
                          : "border-primary"
                        : theme === "dark"
                          ? "border-neutral-focus"
                          : "border-base-300"
                    }`}
                  >
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.name || user.fullName}
                      className="size-full object-cover"
                    />
                  </div>
                  {/* Green dot if online OR if it's the AI bot */}
                  {isOnline && (
                    <span
                      className="absolute bottom-0 right-0 size-3 bg-green-500 
                      rounded-full ring-2 ring-base-100"
                    />
                  )}
                </div>

                {/* User info */}
                <div className="text-left min-w-0 flex-1">
                  <div className="font-medium truncate">{user.fullName || user.name}</div>
                  <div
                    className={`text-sm ${theme === "dark" ? "text-neutral-content/60" : "text-base-content/60"} flex items-center gap-1`}
                  >
                    {user._id === "AI_BOT" ? "AI Assistant" : isOnline ? "Online" : "Offline"}
                  </div>
                </div>
              </button>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-40 p-4">
            <div className={`text-center ${theme === "dark" ? "text-neutral-content/50" : "text-base-content/50"}`}>
              <p className="font-medium">No contacts found</p>
              <p className="text-sm mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : showOnlineOnly
                    ? "No one is online right now"
                    : "Add some friends to chat with"}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar

