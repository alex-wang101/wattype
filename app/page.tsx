"use client"

import { useState, useEffect } from "react"
import { TaskBar } from "@/components/desktop/taskBar"
import { Login } from "@/components/desktop/login"
import { WatTypeWindow } from "@/components/wattype/WatTypeWindow"

export default function Desktop() {
  // Desktop state - just manages which windows are open
  const [isWindowRunning, setIsWindowRunning] = useState(false)
  const [isWindowMinimized, setIsWindowMinimized] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<string | undefined>(undefined)

  // Window is visible when running AND not minimized
  const isWindowVisible = isWindowRunning && !isWindowMinimized

  // Desktop icon position and dragging
  const [iconPos, setIconPos] = useState({ x: 16, y: 16 })
  const [isDraggingIcon, setIsDraggingIcon] = useState(false)
  const [iconDragOffset, setIconDragOffset] = useState({ x: 0, y: 0 })

  // Clock for taskbar
  const [currentTime, setCurrentTime] = useState("")
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Handle icon dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingIcon) {
        const newX = e.clientX - iconDragOffset.x
        const newY = e.clientY - iconDragOffset.y
        setIconPos({
          x: Math.max(0, Math.min(newX, window.innerWidth - 80)),
          y: Math.max(0, Math.min(newY, window.innerHeight - 120))
        })
      }
    }

    const handleMouseUp = () => {
      setIsDraggingIcon(false)
    }

    if (isDraggingIcon) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
    }
  }, [isDraggingIcon, iconDragOffset])

  const handleIconMouseDown = (e: React.MouseEvent) => {
    setIsDraggingIcon(true)
    setIconDragOffset({
      x: e.clientX - iconPos.x,
      y: e.clientY - iconPos.y
    })
  }

  const handleLogin = (username: string, password: string) => {
    setLoggedInUser(username)
    setIsLoginOpen(false)
  }

  return (
    <div className="min-h-screen bg-desktop-bg flex flex-col relative overflow-hidden">
      {/* Desktop Icons */}
      <div className="flex-1 relative">
        <button
          onMouseDown={handleIconMouseDown}
          onDoubleClick={() => {
            setIsWindowRunning(true)
            setIsWindowMinimized(false)
          }}
          className="absolute flex flex-col items-center gap-1 p-2 rounded hover:bg-white/10 w-20 group cursor-move"
          style={{ left: iconPos.x, top: iconPos.y }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded shadow-lg flex items-center justify-center text-2xl border-2 border-yellow-300">
            ⌨️
          </div>
          <span className="text-white text-xs font-mono text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] group-hover:bg-blue-600 px-1">
            WatType!
          </span>
        </button>
      </div>

      {/* WatType Application Window */}
      <WatTypeWindow
        isOpen={isWindowVisible}
        onClose={() => {
          setIsWindowRunning(false)
          setIsWindowMinimized(false)
        }}
        onMinimize={() => setIsWindowMinimized(true)}
      />

      {/* Windows XP Login Dialog */}
      <Login
        isLoginOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />

      {/* Taskbar */}
      <TaskBar
        onStartClick={() => setIsLoginOpen(true)}
        currentTime={currentTime}
        loggedInUser={loggedInUser}
        isWatTypeRunning={isWindowRunning}
        isWatTypeMinimized={isWindowMinimized}
        onWatTypeClick={() => {
          if (!isWindowRunning) {
            setIsWindowRunning(true)
            setIsWindowMinimized(false)
          } else {
            setIsWindowMinimized(!isWindowMinimized)
          }
        }}
      />
    </div>
  )
}
