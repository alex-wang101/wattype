"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"

// Dictionary of common words
const DICTIONARY = [
  "the",
  "be",
  "to",
  "of",
  "and",
  "a",
  "in",
  "that",
  "have",
  "it",
  "for",
  "not",
  "on",
  "with",
  "he",
  "as",
  "you",
  "do",
  "at",
  "this",
  "but",
  "his",
  "by",
  "from",
  "they",
  "we",
  "say",
  "her",
  "she",
  "or",
  "an",
  "will",
  "my",
  "one",
  "all",
  "would",
  "there",
  "their",
  "what",
  "so",
  "up",
  "out",
  "if",
  "about",
  "who",
  "get",
  "which",
  "go",
  "me",
  "when",
  "make",
  "can",
  "like",
  "time",
  "no",
  "just",
  "him",
  "know",
  "take",
  "people",
  "into",
  "year",
  "your",
  "good",
  "some",
  "could",
  "them",
  "see",
  "other",
  "than",
  "then",
  "now",
  "look",
  "only",
  "come",
  "its",
  "over",
  "think",
  "also",
  "back",
  "after",
  "use",
  "two",
  "how",
  "our",
  "work",
  "first",
  "well",
  "way",
  "even",
  "new",
  "want",
  "because",
  "any",
  "these",
  "give",
  "day",
  "most",
  "us",
  "is",
  "was",
  "are",
  "been",
  "has",
  "had",
  "were",
  "said",
  "did",
  "having",
  "may",
  "should",
  "find",
  "long",
  "down",
  "little",
  "world",
  "still",
  "own",
  "see",
  "man",
  "here",
  "thing",
  "give",
  "many",
  "well",
  "only",
  "those",
  "tell",
  "very",
  "her",
  "much",
  "before",
  "through",
  "back",
  "years",
  "where",
  "much",
  "your",
  "way",
  "well",
  "down",
  "should",
  "because",
  "each",
  "just",
  "those",
  "people",
  "take",
  "day",
  "good",
  "how",
  "long",
  "little",
  "own",
  "other",
  "old",
  "right",
  "big",
  "high",
  "different",
  "small",
  "large",
  "next",
  "early",
  "young",
  "important",
  "few",
  "public",
  "bad",
  "same",
  "able",
  "woman",
  "plan",
  "report",
  "better",
  "best",
  "however",
  "lead",
  "social",
  "only",
]

// Simple seeded random number generator
function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

// Generate word list from dictionary with seed
function generateWords(seed: number, count: number): string {
  const rng = seededRandom(seed)
  const words: string[] = []
  for (let i = 0; i < count; i++) {
    const index = Math.floor(rng() * DICTIONARY.length)
    words.push(DICTIONARY[index])
  }
  return words.join(" ")
}

function checkifWordIsCorrect(typedWord: string, targetWord: string) {
  return typedWord === targetWord
}

export default function TypingTest() {
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

  // Initialize target text on mount
  useEffect(() => {
    setTargetText(generateWords(seed, 120))
  }, [seed])

  // Focus input on mount and after restart
  useEffect(() => {
    inputRef.current?.focus()
  }, [seed])

  useEffect(() => {
    if (isFinished || !hasStarted) return

    startTimeRef.current = Date.now()
    const duration = 30000 // 30 seconds in milliseconds
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

    // If the last character is a space, save word and move to next
    if (value.endsWith(" ")) {
      const wordTyped = value.trim() // remove the space
      setTypedWords((prev) => [...prev, wordTyped])
      setCurrentWordIndex((prev) => prev + 1)
      setCurrentWord("")
      return
    }

    // Update currentWord as user types
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

  const targetWordsArray = targetText.split(" ")
  
  // Calculate stats based on completed words + current word
  const elapsedSeconds = hasStarted && !isFinished ? 30 - timeLeft : 30
  
  // Count correct characters across all typed words
  let correctChars = 0
  let totalChars = 0
  
  // Check completed words
  for (let i = 0; i < typedWords.length; i++) {
    const typed = typedWords[i]
    const target = targetWordsArray[i] || ""
    totalChars += typed.length + 1 // +1 for space
    for (let j = 0; j < typed.length; j++) {
      if (typed[j] === target[j]) correctChars++
    }
    // Count space as correct if word was completed
    correctChars++
  }
  
  // Check current word being typed
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
      // Determine if this word has been typed, is current, or is upcoming
      const isCompleted = wordIndex < currentWordIndex
      const isCurrent = wordIndex === currentWordIndex
      const typedWordForThis = isCompleted ? typedWords[wordIndex] : isCurrent ? currentWord : ""
      
      const wordChars = word.split("").map((char, charIndexInWord) => {
        let className = "text-gray-500" // default: not yet typed
        
        if (isCompleted || isCurrent) {
          if (charIndexInWord < typedWordForThis.length) {
            // Character has been typed
            className = typedWordForThis[charIndexInWord] === char ? "text-green-400" : "text-red-400"
          }
        }
        
        // Show caret at current typing position
        const isCaret = isCurrent && charIndexInWord === currentWord.length

        return (
          <span key={charIndexInWord} className={`relative ${className}`}>
            {isCaret && <span className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-waterloo-gold animate-pulse" />}
            {char}
          </span>
        )
      })

      // Show caret after word if user typed more chars than target word has
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
    <div className="min-h-screen bg-desktop-bg flex flex-col">
      <div className="flex justify-end items-center gap-3 px-4 py-2 text-xs font-mono">
        <a href="#" className="text-gray-400 hover:text-waterloo-gold">
          Sign up
        </a>
        <span className="text-gray-600">|</span>
        <a href="#" className="text-gray-400 hover:text-waterloo-gold">
          Log in
        </a>
        <span className="text-gray-600">|</span>
        <a href="#" className="text-gray-400 hover:text-waterloo-gold">
          Excel theme
        </a>
        <select className="bg-charcoal text-gray-300 border border-gray-600 px-2 py-0.5 text-xs font-mono">
          <option>Proverb</option>
        </select>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-5xl">
          {/* Window */}
          <div className="window-border bg-steel-gray">
            {/* Title bar */}
            <div className="flex items-center justify-between px-2 py-1 bg-charcoal">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-waterloo-gold flex items-center justify-center text-xs font-bold">⌨</div>
                <span className="text-waterloo-gold font-mono text-sm font-bold tracking-wide">WatType!</span>
              </div>
              <button className="w-5 h-5 window-border-sm bg-steel-gray hover:bg-gray-400 flex items-center justify-center text-xs font-bold">
                ✕
              </button>
            </div>

            {/* Tab strip */}
            <div className="flex gap-0 bg-steel-gray px-1 pt-1">
              {[
                "Basics",
                "Practice",
                "Words",
                "Advanced",
                "PROVERBS",
                "History",
                "Quotes",
                "Long",
                "Games",
                "Stats",
                "Payment",
              ].map((tab) => (
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
            <div className="window-inset bg-steel-gray p-4 m-2">
              {/* Inner title strip */}
              <div className="flex items-center justify-between px-3 py-1 bg-blue-900 text-white mb-3">
                <span className="font-mono text-sm font-bold">⌨ Short Writing Practice: Proverbs 1997</span>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs">[Number of Times: 0]</span>
                  <span className="font-mono text-sm font-bold">
                    {isFinished ? "Time's Up!" : hasStarted ? `${timeLeft}s` : "30s"}
                  </span>
                  <button className="w-4 h-4 window-border-sm bg-steel-gray hover:bg-gray-400 flex items-center justify-center text-xs font-bold text-charcoal">
                    ✕
                  </button>
                </div>
              </div>

              {/* Typing area */}
              <div className="window-inset bg-off-white p-6 mb-4 min-h-[240px]">
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
              <div className="grid grid-cols-2 gap-4">
                {/* Left: Speed/Accuracy bars */}
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

                {/* Right: Results */}
                <div className="window-border bg-steel-gray p-3">
                  <div className="text-center font-mono text-sm font-bold mb-3 tracking-wide">Results</div>

                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between">
                      <span>Words Typed:</span>
                      <span className="font-bold">{typedWords.length} words</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Correct Keys:</span>
                      <span className="font-bold">{correctWords} hits</span>
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
              {(
                <div className="mt-4 text-center">
                  <button
                    onClick={restart}
                    className="window-border bg-steel-gray hover:bg-gray-400 px-6 py-2 font-mono text-sm font-bold"
                  >
                    Restart
                  </button>
                </div>
              )}
            </div>

            {/* Footer language selector */}
            <div className="flex items-center gap-2 px-3 py-1 bg-steel-gray border-t border-gray-400">
              <span className="font-mono text-xs font-bold">English</span>
              <button className="w-5 h-5 window-border-sm bg-gray-400 flex items-center justify-center text-xs">
                ⌨
              </button>
              <button className="w-5 h-5 window-border-sm bg-gray-400 flex items-center justify-center text-xs">
                -
              </button>
              <button className="w-5 h-5 window-border-sm bg-gray-400 flex items-center justify-center text-xs">
                +
              </button>
              <span className="ml-auto font-mono text-xs">Zoom In / out</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 ${i <= 2 ? "bg-blue-600" : i === 3 ? "bg-green-500" : "bg-gray-300"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
