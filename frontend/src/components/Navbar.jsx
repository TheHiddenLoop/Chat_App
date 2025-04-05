"use client"

import { Link } from "react-router-dom"
import { useAuthStore } from "../store/useAuthStore"
import { LogOut, Menu, MessageSquare, Settings, User, Users, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"

const Navbar = () => {
  const { logout, authUser } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [mobileMenuOpen])

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Chatty</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link to={"/settings"} className="btn btn-sm gap-2 transition-colors">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/friends"} className="btn btn-sm gap-2">
                  <Users className="size-5" />
                  <span>Friends</span>
                </Link>

                <Link to={"/profile"} className="btn btn-sm gap-2">
                  <User className="size-5" />
                  <span>Profile</span>
                </Link>

                <button className="btn btn-sm gap-2" onClick={logout}>
                  <LogOut className="size-5" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="btn btn-sm btn-circle">
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div
          ref={menuRef}
          className="md:hidden absolute top-16 right-0 left-0 bg-base-100 border-b border-base-300 shadow-lg z-50"
        >
          <div className="flex flex-col p-2">
            <Link
              to={"/settings"}
              className="flex items-center gap-2 p-3 hover:bg-base-200 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>

            {authUser && (
              <>
                <Link
                  to={"/friends"}
                  className="flex items-center gap-2 p-3 hover:bg-base-200 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="size-5" />
                  <span>Friends</span>
                </Link>

                <Link
                  to={"/profile"}
                  className="flex items-center gap-2 p-3 hover:bg-base-200 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="size-5" />
                  <span>Profile</span>
                </Link>

                <button
                  className="flex items-center gap-2 p-3 hover:bg-base-200 rounded-md text-left w-full"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    logout()
                  }}
                >
                  <LogOut className="size-5" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar

