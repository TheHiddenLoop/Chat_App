
import { useState, useEffect } from "react"
import { UserPlus, Users, Check, X, Search } from "lucide-react"
import { useFriendStore } from "../store/useFriendStore"
import { debounce } from "lodash"


const maskEmail = (email) => {
  if (!email) return "No email available"

  const [localPart, domain] = email.split("@")

  if (!domain) return email 

  
  const visiblePart = localPart.slice(-2)
  const maskedPart = "*".repeat(localPart.length - 2)

  return `${maskedPart}${visiblePart}@${domain}`
}

const FriendPage = () => {
  const [activeTab, setActiveTab] = useState("sendRequest")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredResults, setFilteredResults] = useState([])

  const {
    searchResults = [],
    friendRequests = [],
    fetchRequests,
    searchUsers,
    sendRequest,
    acceptRequest,
    rejectRequest,
  } = useFriendStore()

  useEffect(() => {
    if (activeTab === "requests") {
      fetchRequests()
    } else {
      setSearchTerm("")
      setFilteredResults([])
    }
  }, [activeTab, fetchRequests])

  const debouncedSearch = debounce((query) => {
    if (query.trim() !== "") {
      searchUsers(query)
    }
  }, 500)

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.trim() === "") {
      setFilteredResults([])
    } else {
      debouncedSearch(value)
    }
  }

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredResults([])
    } else {
      setFilteredResults(searchResults.filter((user) => user.fullName.toLowerCase().includes(searchTerm.toLowerCase())))
    }
  }, [searchResults, searchTerm])

  return (
    <div className="h-screen bg-base-200 flex items-center justify-center pt-20 px-1">
      <div className="bg-base-100 rounded-lg shadow-lg w-full max-w-6xl h-[calc(100vh-8rem)] p-4">
        {/* Tabs */}
        <div className="flex space-x-4 border-b pb-2 mb-4">
          <button
            className={`p-2 rounded-md transition flex items-center space-x-2 ${
              activeTab === "sendRequest" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            }`}
            onClick={() => setActiveTab("sendRequest")}
          >
            <UserPlus className="w-5 h-5" />
            <span className="hidden md:inline">Send Request</span>
          </button>
          <button
            className={`p-2 rounded-md transition flex items-center space-x-2 ${
              activeTab === "requests" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            }`}
            onClick={() => setActiveTab("requests")}
          >
            <Users className="w-5 h-5" />
            <span className="hidden md:inline">Requests</span>
          </button>
        </div>

        {/* Search Users */}
        {activeTab === "sendRequest" && (
          <div className="p-4 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search for friends..."
              className="w-full p-2 border rounded-md"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button
              onClick={() => debouncedSearch(searchTerm)}
              className="p-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Search Results */}
        {activeTab === "sendRequest" &&
          searchTerm.trim() !== "" &&
          (filteredResults.length > 0 || searchResults.length > 0) && (
            <ul className="p-2 space-y-2">
              {(filteredResults.length > 0 ? filteredResults : searchResults).map((user) => (
                <li key={user._id} className="p-4 flex flex-col rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-3 mb-2">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName || "User"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-lg">{user.fullName || "Unknown User"}</p>
                      <p className="text-gray-500">{maskEmail(user.email)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => sendRequest(user.email)}
                    className="w-full p-2 flex items-center justify-center space-x-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Send Request</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

        {/* Friend Requests */}
        {activeTab === "requests" && friendRequests.length > 0 && (
          <ul className="p-2 space-y-2">
            {friendRequests.map((request) => {
              const sender = request.sender || {}
              return (
                <li key={request._id} className="p-4 flex flex-col rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-3 mb-2">
                    <img
                      src={sender.profilePic || "/avatar.png"}
                      alt={sender.fullName || "User"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-lg">{sender.fullName || "Unknown User"}</p>
                      <p className="text-gray-500">{maskEmail(sender.email)}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => acceptRequest(request._id)}
                      className="w-full p-2 flex items-center justify-center space-x-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                      <Check className="w-5 h-5" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => rejectRequest(request._id)}
                      className="w-full p-2 flex items-center justify-center space-x-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                      <X className="w-5 h-5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {/* No Requests Message */}
        {activeTab === "requests" && friendRequests.length === 0 && (
          <p className="text-center text-gray-500">No friend requests.</p>
        )}
      </div>
    </div>
  )
}

export default FriendPage

