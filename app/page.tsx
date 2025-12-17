"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"

// Dictionary of common words
const DICTIONARY = [
  "the", "and", "be", "to", "of", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what", "so",
  "up", "out", "if", "about", "who", "get", "which", "go", "me", "when",
  "make", "can", "like", "time", "no", "just", "him", "know", "take", "people",
  "into", "year", "your", "good", "some", "could", "them", "see", "other", "than",
  "then", "now", "look", "only", "come", "its", "over", "think", "also", "back",
  "after", "use", "two", "how", "our", "work", "first", "well", "way", "even",
  "new", "want", "because", "any", "these", "give", "day", "most", "us", "is",
  "was", "are", "been", "has", "had", "were", "said", "did", "having", "may",
  "should", "find", "long", "down", "little", "world", "still", "own", "man", "here",
  "thing", "many", "tell", "very", "much", "before", "through", "years", "where", "each",
  "old", "right", "big", "high", "different", "small", "large", "next", "early", "young",
  "important", "few", "public", "bad", "same", "able", "woman", "plan", "report", "better",
  "best", "however", "lead", "social",
]

function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

function generateWords(seed: number, count: number): string {
  const rng = seededRandom(seed)
  const words: string[] = []
  for (let i = 0; i < count; i++) {
    const index = Math.floor(rng() * DICTIONARY.length)
    words.push(DICTIONARY[index])
  }
  return words.join(" ")
}

export default function TypingTest() {
  const [isWindowOpen, setIsWindowOpen] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000000))
  const [targetText, setTargetText] = useState("")
  const [typedWords, setTypedWords] = useState<string[]>([])
  const [currentWord, setCurrentWord] = useState("")
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isFinished, setIsFinished] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const startTimeRef = useRef<number>(0)
  const animationFrameRef = useRef<number | undefined>(undefined)

  // Window position and size
  const [windowPos, setWindowPos] = useState({ x: 100, y: 50 })
  const [windowSize, setWindowSize] = useState({ width: 900, height: 650 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  // Initialize target text on mount
  useEffect(() => {
    setTargetText(generateWords(seed, 120))
  }, [seed])

  // Center window on first open
  useEffect(() => {
    if (isWindowOpen && typeof window !== 'undefined') {
      const centerX = (window.innerWidth - windowSize.width) / 2
      const centerY = (window.innerHeight - windowSize.height - 40) / 2
      setWindowPos({ x: Math.max(0, centerX), y: Math.max(0, centerY) })
    }
  }, [isWindowOpen])

  // Focus input when window opens
  useEffect(() => {
    if (isWindowOpen) {
    inputRef.current?.focus()
    }
  }, [isWindowOpen, seed])

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y
        setWindowPos({
          x: Math.max(0, Math.min(newX, window.innerWidth - 100)),
          y: Math.max(0, Math.min(newY, window.innerHeight - 100))
        })
      }
      
      if (isResizing && !isMaximized) {
        const minWidth = 600
        const minHeight = 400
        
        if (isResizing.includes('e')) {
          const newWidth = Math.max(minWidth, e.clientX - windowPos.x)
          setWindowSize(prev => ({ ...prev, width: newWidth }))
        }
        if (isResizing.includes('w')) {
          const newWidth = Math.max(minWidth, windowPos.x + windowSize.width - e.clientX)
          const newX = e.clientX
          if (newWidth >= minWidth) {
            setWindowSize(prev => ({ ...prev, width: newWidth }))
            setWindowPos(prev => ({ ...prev, x: newX }))
          }
        }
        if (isResizing.includes('s')) {
          const newHeight = Math.max(minHeight, e.clientY - windowPos.y)
          setWindowSize(prev => ({ ...prev, height: newHeight }))
        }
        if (isResizing.includes('n')) {
          const newHeight = Math.max(minHeight, windowPos.y + windowSize.height - e.clientY)
          const newY = e.clientY
          if (newHeight >= minHeight) {
            setWindowSize(prev => ({ ...prev, height: newHeight }))
            setWindowPos(prev => ({ ...prev, y: newY }))
          }
        }
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(null)
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
    }
  }, [isDragging, isResizing, dragOffset, windowPos, windowSize, isMaximized])

  useEffect(() => {
    if (isFinished || !hasStarted) return

    startTimeRef.current = Date.now()
    const duration = 30000
    const endTime = startTimeRef.current + duration

    const updateTimer = () => {
      const now = Date.now()
      const remaining = Math.max(0, endTime - now)
      const secondsLeft = Math.ceil(remaining / 1000)

      setTimeLeft(secondsLeft)

      if (remaining > 0) {
        animationFrameRef.current = requestAnimationFrame(updateTimer)
      } else {
        setIsFinished(true)
      }
    }

    animationFrameRef.current = requestAnimationFrame(updateTimer)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [hasStarted, isFinished])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinished) return

    const value = e.target.value

    if (value.length === 1 && !hasStarted) {
      setHasStarted(true)
    }

    if (value.endsWith(" ")) {
      const wordTyped = value.trim()
      setTypedWords((prev) => [...prev, wordTyped])
      setCurrentWordIndex((prev) => prev + 1)
      setCurrentWord("")
      return
    }

    setCurrentWord(value)
  }

  const restart = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 1000000)
    setSeed(newSeed)
    setTypedWords([])
    setCurrentWord("")
    setCurrentWordIndex(0)
    setTimeLeft(30)
    setIsFinished(false)
    setHasStarted(false)
  }, [])

  const openWindow = () => {
    setIsWindowOpen(true)
    restart()
  }

  const closeWindow = () => {
    setIsWindowOpen(false)
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    setTypedWords([])
    setCurrentWord("")
    setCurrentWordIndex(0)
    setTimeLeft(30)
    setIsFinished(false)
    setHasStarted(false)
  }

  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - windowPos.x,
      y: e.clientY - windowPos.y
    })
  }

  const handleResizeMouseDown = (direction: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(direction)
  }

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized)
  }

  const targetWordsArray = targetText.split(" ")
  const elapsedSeconds = hasStarted && !isFinished ? 30 - timeLeft : 30
  
  let correctChars = 0
  let totalChars = 0
  
  for (let i = 0; i < typedWords.length; i++) {
    const typed = typedWords[i]
    const target = targetWordsArray[i] || ""
    totalChars += typed.length + 1
    for (let j = 0; j < typed.length; j++) {
      if (typed[j] === target[j]) correctChars++
    }
    correctChars++
  }
  
  const currentTargetWord = targetWordsArray[currentWordIndex] || ""
  for (let j = 0; j < currentWord.length; j++) {
    totalChars++
    if (currentWord[j] === currentTargetWord[j]) correctChars++
  }
  
  const charsTyped = totalChars
  const accuracy = charsTyped > 0 ? (correctChars / charsTyped) * 100 : 0
  const wpm = elapsedSeconds > 0 ? correctChars / 5 / (elapsedSeconds / 60) : 0

  let correctWords = 0
  for (let i = 0; i < typedWords.length; i++) {
    if (typedWords[i] === targetWordsArray[i]) {
      correctWords++
    }
  }

  const renderTargetText = () => {
    return targetWordsArray.map((word, wordIndex) => {
      const isCompleted = wordIndex < currentWordIndex
      const isCurrent = wordIndex === currentWordIndex
      const typedWordForThis = isCompleted ? typedWords[wordIndex] : isCurrent ? currentWord : ""
      
      const wordChars = word.split("").map((char, charIndexInWord) => {
        let className = "text-gray-500"

        if (isCompleted || isCurrent) {
          if (charIndexInWord < typedWordForThis.length) {
            className = typedWordForThis[charIndexInWord] === char ? "text-green-400" : "text-red-400"
          }
        }
        
        const isCaret = isCurrent && charIndexInWord === currentWord.length

        return (
          <span key={charIndexInWord} className={`relative ${className}`}>
            {isCaret && <span className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-waterloo-gold animate-pulse" />}
            {char}
          </span>
        )
      })

      const caretAfterWord = isCurrent && currentWord.length >= word.length

      return (
        <span key={wordIndex}>
          {wordChars}
          {caretAfterWord && (
            <span className="relative">
              <span className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-waterloo-gold animate-pulse" />
          </span>
          )}
          <span className="text-gray-500"> </span>
        </span>
      )
    })
  }

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

  return (
    <div className="min-h-screen bg-desktop-bg flex flex-col relative overflow-hidden">
      {/* Desktop Icons */}
      <div className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          <button
            onDoubleClick={openWindow}
            className="flex flex-col items-center gap-1 p-2 rounded hover:bg-white/10 w-20 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded shadow-lg flex items-center justify-center text-2xl border-2 border-yellow-300">
              ⌨️
            </div>
            <span className="text-white text-xs font-mono text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] group-hover:bg-blue-600 px-1">
              WatType!
            </span>
          </button>
        </div>
      </div>

      {/* Application Window */}
      {isWindowOpen && (
        <div
          ref={windowRef}
          className="absolute z-10"
          style={isMaximized ? {
            top: 0,
            left: 0,
            right: 0,
            bottom: 40,
            width: '100%',
            height: 'calc(100vh - 40px)',
          } : {
            left: windowPos.x,
            top: windowPos.y,
            width: windowSize.width,
            height: windowSize.height,
          }}
        >
          <div className="window-border bg-steel-gray shadow-2xl h-full flex flex-col relative">
            {/* Resize handles */}
            {!isMaximized && (
              <>
                <div className="absolute -top-1 left-2 right-2 h-2 cursor-n-resize" onMouseDown={handleResizeMouseDown('n')} />
                <div className="absolute -bottom-1 left-2 right-2 h-2 cursor-s-resize" onMouseDown={handleResizeMouseDown('s')} />
                <div className="absolute top-2 -left-1 w-2 bottom-2 cursor-w-resize" onMouseDown={handleResizeMouseDown('w')} />
                <div className="absolute top-2 -right-1 w-2 bottom-2 cursor-e-resize" onMouseDown={handleResizeMouseDown('e')} />
                <div className="absolute -top-1 -left-1 w-4 h-4 cursor-nw-resize" onMouseDown={handleResizeMouseDown('nw')} />
                <div className="absolute -top-1 -right-1 w-4 h-4 cursor-ne-resize" onMouseDown={handleResizeMouseDown('ne')} />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 cursor-sw-resize" onMouseDown={handleResizeMouseDown('sw')} />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 cursor-se-resize" onMouseDown={handleResizeMouseDown('se')} />
              </>
            )}

            {/* Title bar */}
            <div 
              className="flex items-center justify-between px-2 py-1 bg-gradient-to-r from-blue-800 to-blue-500 cursor-move select-none"
              onMouseDown={handleTitleBarMouseDown}
              onDoubleClick={toggleMaximize}
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-waterloo-gold flex items-center justify-center text-xs font-bold rounded-sm">⌨</div>
                <span className="text-white font-mono text-sm font-bold tracking-wide">WatType!</span>
              </div>
              <div className="flex gap-1" onMouseDown={e => e.stopPropagation()}>
                <button className="w-5 h-5 window-border-sm bg-steel-gray hover:bg-gray-300 flex items-center justify-center text-xs font-bold">
                  _
                </button>
                <button 
                  onClick={toggleMaximize}
                  className="w-5 h-5 window-border-sm bg-steel-gray hover:bg-gray-300 flex items-center justify-center text-xs font-bold"
                >
                  {isMaximized ? '❐' : '□'}
                </button>
                <button 
                  onClick={closeWindow}
                  className="w-5 h-5 window-border-sm bg-red-500 hover:bg-red-600 flex items-center justify-center text-xs font-bold text-white"
                >
                ✕
              </button>
              </div>
            </div>

            {/* Tab strip */}
            <div className="flex gap-0 bg-steel-gray px-1 pt-1 flex-shrink-0">
              {["Basics", "Practice", "Words", "Advanced", "PROVERBS", "History", "Quotes", "Long", "Games", "Stats"].map((tab) => (
                <div
                  key={tab}
                  className={`px-3 py-1 text-xs font-mono ${
                    tab === "PROVERBS"
                      ? "window-border-sm bg-steel-gray text-charcoal font-bold"
                      : "bg-gray-500 text-gray-300 border-b border-gray-400"
                  }`}
                >
                  {tab}
                </div>
              ))}
            </div>

            {/* Content panel */}
            <div className="window-inset bg-steel-gray p-4 m-2 flex-1 overflow-auto flex flex-col">
              {/* Inner title strip */}
              <div className="flex items-center justify-between px-3 py-1 bg-blue-900 text-white mb-3 flex-shrink-0">
                <span className="font-mono text-sm font-bold">⌨ Short Writing Practice: Proverbs 1997</span>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs">[Number of Times: 0]</span>
                  <span className="font-mono text-sm font-bold">
                    {isFinished ? "Time's Up!" : hasStarted ? `${timeLeft}s` : "30s"}
                  </span>
                </div>
              </div>

              {/* Typing area */}
              <div className="window-inset bg-off-white p-6 mb-4 flex-1 overflow-auto">
                <div className="font-mono text-lg leading-relaxed tracking-wide mb-4">{renderTargetText()}</div>
                <div className="window-inset-thin bg-white">
                  <textarea
                    ref={inputRef}
                    value={currentWord}
                    onChange={handleInputChange}
                    disabled={isFinished}
                    className="w-full h-20 bg-transparent font-mono text-base p-2 resize-none focus:outline-none"
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                </div>
              </div>

              {/* Bottom section with bars and results */}
              <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                <div className="window-border bg-steel-gray p-3">
                  <div className="text-center font-mono text-sm font-bold mb-3 tracking-wide">Speed & Accuracy</div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs w-20">Best Speed:</span>
                      <div className="flex-1 window-inset-thin bg-white h-6 flex items-center">
                        <div className="bg-red-500 h-full" style={{ width: "0%" }}>
                          <span className="px-1 text-white text-xs font-bold">0</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs w-20">Current WPM:</span>
                      <div className="flex-1 window-inset-thin bg-white h-6 flex items-center">
                        <div
                          className="bg-blue-600 h-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (wpm / 100) * 100)}%` }}
                        >
                          <span className="px-1 text-white text-xs font-bold">{Math.round(wpm)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs w-20">Accuracy:</span>
                      <div className="flex-1 window-inset-thin bg-white h-6 flex items-center">
                        <div
                          className="bg-cyan-500 h-full transition-all duration-300"
                          style={{ width: `${accuracy}%` }}
                        >
                          <span className="px-1 text-white text-xs font-bold">{Math.round(accuracy)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="window-border bg-steel-gray p-3">
                  <div className="text-center font-mono text-sm font-bold mb-3 tracking-wide">Results</div>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between">
                      <span>Words Typed:</span>
                      <span className="font-bold">{typedWords.length} words</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Correct Words:</span>
                      <span className="font-bold">{correctWords} words</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Practice Time:</span>
                      <span className="font-bold">{elapsedSeconds.toFixed(1)} seconds</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Speed (WPM):</span>
                      <span className="font-bold">{Math.round(wpm)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accuracy:</span>
                      <span className="font-bold">{Math.round(accuracy)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Restart button */}
              <div className="mt-4 text-center flex-shrink-0">
                  <button
                    onClick={restart}
                    className="window-border bg-steel-gray hover:bg-gray-400 px-6 py-2 font-mono text-sm font-bold"
                  >
                    Restart
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Windows XP Login Dialog */}
      {isLoginOpen && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/50">
          <div 
            className="shadow-2xl"
            style={{
              width: '460px',
              border: '3px solid #0052cc',
              fontFamily: 'Tahoma, Arial, sans-serif',
            }}
          >
            {/* Title bar - dark blue gradient */}
            <div 
              className="px-2 py-1 flex items-center justify-between"
              style={{
                background: 'linear-gradient(to right, #0a246a, #0052cc, #6699ff, #0052cc, #0a246a)',
              }}
            >
              <span className="text-white font-bold text-xs tracking-wide">Log On to Windows</span>
              <button
                onClick={() => setIsLoginOpen(false)}
                className="w-[21px] h-[21px] flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: 'linear-gradient(to bottom, #c85050, #b33a3a)',
                  border: '1px solid #ffffff40',
                  borderRadius: '3px',
                  boxShadow: 'inset 1px 1px 0 #ff8080, inset -1px -1px 0 #802020',
                }}
              >
                ✕
              </button>
            </div>

            {/* Blue banner with Windows XP logo */}
            <div 
              className="relative overflow-hidden"
              style={{
                background: 'linear-gradient(to bottom, #3a6ea5, #6699ff 30%, #4a8cd8 70%, #2a5a8a)',
                height: '90px',
              }}
            >
              {/* Windows XP Logo - 4 color squares */}
              <div className="absolute left-4 top-3 flex flex-col gap-[2px]">
                <div className="flex gap-[2px]">
                  <div style={{ width: '14px', height: '14px', backgroundColor: '#ff6b35', transform: 'skewX(-10deg)' }} />
                  <div style={{ width: '14px', height: '14px', backgroundColor: '#52b552', transform: 'skewX(-10deg)' }} />
                </div>
                <div className="flex gap-[2px]">
                  <div style={{ width: '14px', height: '14px', backgroundColor: '#0052cc', transform: 'skewX(-10deg)' }} />
                  <div style={{ width: '14px', height: '14px', backgroundColor: '#ffb81c', transform: 'skewX(-10deg)' }} />
                </div>
              </div>

              {/* Microsoft Windows XP text */}
              <div className="absolute left-12 top-2 flex items-baseline">
                <span className="text-white/80 text-[10px] mr-1" style={{ fontFamily: 'Arial, sans-serif' }}>Microsoft</span>
                <span className="text-white font-bold text-[28px] tracking-tight" style={{ fontFamily: 'Arial, sans-serif', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>Windows</span>
                <span className="text-white font-light text-[18px] ml-0.5" style={{ fontFamily: 'Arial, sans-serif', fontStyle: 'italic' }}>xp</span>
              </div>
              
              {/* Professional x64 Edition */}
              <div className="absolute left-[52px] top-[38px]">
                <span className="text-white text-[13px]" style={{ fontFamily: 'Arial, sans-serif' }}>Professional x64 Edition</span>
              </div>

              {/* Copyright text - bottom left */}
              <div className="absolute left-2 bottom-1 text-white/70 text-[9px]" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                <div>Copyright © 1985-2005</div>
                <div>Microsoft Corporation</div>
              </div>

              {/* Microsoft italic text - bottom right */}
              <div className="absolute right-3 bottom-2">
                <span className="text-white/90 text-[11px] italic font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>Microsoft</span>
              </div>
            </div>

            {/* Form area - light gray with 3D inset border */}
            <div 
              style={{
                backgroundColor: '#c0c0c0',
                borderTop: '2px solid #808080',
                padding: '20px 24px',
              }}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label 
                    className="text-[11px] text-black"
                    style={{ width: '70px', fontFamily: 'Tahoma, sans-serif' }}
                  >
                    User name:
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1 text-[11px] px-1 py-[2px] focus:outline-none"
                    style={{
                      fontFamily: 'Tahoma, sans-serif',
                      border: '1px solid #7f9db9',
                      backgroundColor: 'white',
                    }}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label 
                    className="text-[11px] text-black"
                    style={{ width: '70px', fontFamily: 'Tahoma, sans-serif' }}
                  >
                    Password:
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 text-[11px] px-1 py-[2px] focus:outline-none"
                    style={{
                      fontFamily: 'Tahoma, sans-serif',
                      border: '1px solid #7f9db9',
                      backgroundColor: 'white',
                    }}
                  />
                </div>
              </div>

              {/* Buttons row */}
              <div className="flex justify-center gap-[6px] mt-6">
                <button 
                  onClick={() => setIsLoginOpen(false)}
                  className="text-[11px] px-4 py-[3px] min-w-[75px] focus:outline-none"
                  style={{
                    fontFamily: 'Tahoma, sans-serif',
                    backgroundColor: '#ece9d8',
                    border: '1px solid #003c74',
                    borderRadius: '3px',
                    boxShadow: 'inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080, 0 0 0 1px #0054e3',
                  }}
                >
                  OK
                </button>
                <button 
                  onClick={() => setIsLoginOpen(false)}
                  className="text-[11px] px-4 py-[3px] min-w-[75px] focus:outline-none"
                  style={{
                    fontFamily: 'Tahoma, sans-serif',
                    backgroundColor: '#ece9d8',
                    border: '1px solid #aca899',
                    borderRadius: '3px',
                    boxShadow: 'inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080',
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="text-[11px] px-3 py-[3px] focus:outline-none"
                  style={{
                    fontFamily: 'Tahoma, sans-serif',
                    backgroundColor: '#ece9d8',
                    border: '1px solid #aca899',
                    borderRadius: '3px',
                    boxShadow: 'inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080',
                  }}
                >
                  Shut Down...
                </button>
                <button 
                  className="text-[11px] px-3 py-[3px] focus:outline-none"
                  style={{
                    fontFamily: 'Tahoma, sans-serif',
                    backgroundColor: '#ece9d8',
                    border: '1px solid #aca899',
                    borderRadius: '3px',
                    boxShadow: 'inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080',
                  }}
                >
                  Options &lt;&lt;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Windows XP Taskbar */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-600 to-blue-800 h-10 flex items-center px-1 border-t-2 border-blue-400 z-20">
        <button 
          onClick={() => setIsLoginOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white font-bold px-4 py-1 rounded-r-lg text-sm shadow-md border border-green-400"
        >
          <span className="text-lg">🪟</span>
          <span>Start</span>
        </button>

        <div className="h-6 w-px bg-blue-400 mx-2" />

        <div className="flex-1 flex items-center gap-1 px-2">
          {isWindowOpen && (
            <button 
              className="flex items-center gap-2 bg-blue-900/80 hover:bg-blue-800 text-white px-3 py-1 text-xs font-mono min-w-[150px] border border-blue-400 rounded-sm"
              onClick={() => inputRef.current?.focus()}
            >
              <span>⌨</span>
              <span>WatType!</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 bg-blue-900/50 px-3 py-1 text-white text-xs font-mono border-l border-blue-400">
          <span>🔊</span>
          <span>🔌</span>
          <span>{currentTime}</span>
        </div>
      </div>
    </div>
  )
}
