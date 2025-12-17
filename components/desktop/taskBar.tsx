interface TaskBarProps {
  onStartClick: () => void
  currentTime: string
  loggedInUser?: string
  isWatTypeRunning: boolean
  isWatTypeMinimized: boolean
  onWatTypeClick: () => void
}

export function TaskBar({
  onStartClick,
  currentTime,
  loggedInUser,
  isWatTypeRunning,
  isWatTypeMinimized,
  onWatTypeClick
}: TaskBarProps) {
  return (
    <div className="bg-gradient-to-r from-blue-800 via-blue-600 to-blue-800 h-10 flex items-center px-1 border-t-2 border-blue-400 z-20">
      <button
        onClick={onStartClick}
        className="flex items-center gap-2 bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white font-bold px-4 py-1 rounded-r-lg text-sm shadow-md border border-green-400"
      >
        <span className="text-lg">🪟</span>
        <span>Start</span>
      </button>

      <div className="h-6 w-px bg-blue-400 mx-2" />

      {/* Running applications */}
      <div className="flex-1 flex items-center gap-1 px-2">
        <button
          onDoubleClick={onWatTypeClick}
          className="flex flex-col items-center justify-center px-2 py-1 transition-colors hover:bg-blue-600/30 rounded"
        >
          {/* Golden-yellow square with keyboard icon */}
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded flex items-center justify-center border border-yellow-300">
            <svg
              width="20"
              height="14"
              viewBox="0 0 32 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <rect x="2" y="8" width="28" height="14" rx="1" fill="currentColor" opacity="0.9" />
              <rect x="3" y="10" width="3" height="2" fill="white" />
              <rect x="7" y="10" width="3" height="2" fill="white" />
              <rect x="11" y="10" width="3" height="2" fill="white" />
              <rect x="15" y="10" width="3" height="2" fill="white" />
              <rect x="19" y="10" width="3" height="2" fill="white" />
              <rect x="23" y="10" width="3" height="2" fill="white" />
              <rect x="27" y="10" width="3" height="2" fill="white" />
              <rect x="5" y="15" width="22" height="3" rx="0.5" fill="white" />
            </svg>
          </div>
          {/* Dot indicator underneath when window is open */}
          {isWatTypeRunning && (
            <div className="w-1.5 h-1.5 bg-blue-300 rounded-full mt-0.5" />
          )}
        </button>

        {loggedInUser && !isWatTypeRunning && (
          <span className="text-white text-xs font-mono">
            Welcome, {loggedInUser}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 bg-blue-900/50 px-3 py-1 text-white text-xs font-mono border-l border-blue-400">
        <span>🔊</span>
        <span>🔌</span>
        <span>{currentTime}</span>
      </div>
    </div>
  )
}