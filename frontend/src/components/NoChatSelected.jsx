import { MessageSquare } from "lucide-react"

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-gradient-to-br from-base-100 to-base-200/50">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center
             justify-center animate-pulse"
            >
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-base-100 flex items-center justify-center shadow-md">
              <div className="w-6 h-6 rounded-full bg-green-500 animate-ping opacity-75"></div>
              <div className="absolute w-4 h-4 rounded-full bg-green-500"></div>
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-focus bg-clip-text text-transparent">
          Welcome to Chatty!
        </h2>
        <p className="text-base-content/70 text-lg">Select a conversation from the sidebar to start chatting</p>

        <div className="pt-4">
          <div className="flex justify-center gap-3 mt-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NoChatSelected
