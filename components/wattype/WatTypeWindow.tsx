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

interface WatTypeWindowProps {
  isOpen: boolean
  onClose: () => void
  onMinimize: () => void
}

export function WatTypeWindow({ isOpen, onClose, onMinimize }: WatTypeWindowProps) {
  // Game state
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

  // Window state
  const [isMaximized, setIsMaximized] = useState(false)
  const [windowPos, setWindowPos] = useState({ x: 100, y: 50 })
  const [windowSize, setWindowSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return {
        width: Math.min(900, window.innerWidth - 40),
        height: Math.min(650, window.innerHeight - 80)
      }
    }
    return { width: 900, height: 650 }
  })
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
    if (isOpen && typeof window !== 'undefined') {
      const centerX = (window.innerWidth - windowSize.width) / 2
      const centerY = (window.innerHeight - windowSize.height - 40) / 2
      setWindowPos({ x: Math.max(0, centerX), y: Math.max(0, centerY) })
    }
  }, [isOpen])

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return
      
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight - 40

      setWindowSize(prev => ({
        width: Math.min(prev.width, screenWidth - 20),
        height: Math.min(prev.height, screenHeight - 20)
      }))
      
      setWindowPos(prev => ({
        x: Math.max(0, Math.min(prev.x, screenWidth - 100)),
        y: Math.max(0, Math.min(prev.y, screenHeight - 100))
      }))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Focus input when window opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen, seed])

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

  // Timer effect
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

  // Don't render if not open (must be after all hooks!)
  if (!isOpen) return null

  const handleClose = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    setTypedWords([])
    setCurrentWord("")
    setCurrentWordIndex(0)
    setTimeLeft(30)
    setIsFinished(false)
    setHasStarted(false)
    onClose()
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

  // Calculate stats
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

  return (
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
          className="flex items-center justify-between px-2 py-1 bg-gradient-to-r from-blue-800 to-blue-500 cursor-move select-none relative z-10"
          onMouseDown={handleTitleBarMouseDown}
          onDoubleClick={toggleMaximize}
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-waterloo-gold flex items-center justify-center text-xs font-bold rounded-sm">⌨</div>
            <span className="text-white font-mono text-sm font-bold tracking-wide">WatType!</span>
          </div>
          <div className="flex gap-1 relative z-20" onMouseDown={e => e.stopPropagation()}>
            <button 
              onClick={onMinimize}
              className="w-5 h-5 window-border-sm bg-steel-gray hover:bg-gray-300 flex items-center justify-center text-xs font-bold"
            >
              _
            </button>
            <button 
              onClick={toggleMaximize}
              className="w-5 h-5 window-border-sm bg-steel-gray hover:bg-gray-300 flex items-center justify-center text-xs font-bold"
            >
              {isMaximized ? '❐' : '□'}
            </button>
            <button 
              onClick={handleClose}
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
  )
}

