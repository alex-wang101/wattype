"use client"

import { useState } from "react"

interface LoginProps {
    isLoginOpen: boolean
    onClose: () => void
    onLogin: (username: string, password: string) => void
}

export function Login({ isLoginOpen, onClose, onLogin }: LoginProps) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    if (!isLoginOpen) return null;
    return (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/50">
          <div className="xp-login-dialog shadow-2xl">
            {/* Title bar */}
            <div className="xp-login-titlebar">
              <span className="xp-login-titlebar-text">Log On to Windows</span>
              <button onClick={onClose} className="xp-login-close-btn">
                ✕
              </button>
            </div>

            {/* Blue banner with Windows XP logo */}
            <div className="xp-login-banner">
              {/* Windows XP Logo - 4 color squares */}
              <div className="xp-logo-squares">
                <div className="xp-logo-row">
                  <div className="xp-logo-square xp-logo-red" />
                  <div className="xp-logo-square xp-logo-green" />
                </div>
                <div className="xp-logo-row">
                  <div className="xp-logo-square xp-logo-blue" />
                  <div className="xp-logo-square xp-logo-yellow" />
                </div>
              </div>

              {/* Microsoft Windows XP text */}
              <div className="xp-windows-text">
                <span className="xp-microsoft-label">Microsoft</span>
                <span className="xp-windows-label">Windows</span>
                <span className="xp-xp-label">xp</span>
              </div>
              
              {/* Professional x64 Edition */}
              <span className="xp-edition-text">Professional x64 Edition</span>

              {/* Copyright text */}
              <div className="xp-copyright">
                <div>Copyright © 1985-2005</div>
                <div>Microsoft Corporation</div>
              </div>

              {/* Microsoft italic text */}
              <span className="xp-microsoft-italic">Microsoft</span>
            </div>

            {/* Form area */}
            <div className="xp-login-form">
              <div className="xp-form-row">
                <label className="xp-form-label">User name:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="xp-form-input"
                />
              </div>
              <div className="xp-form-row">
                <label className="xp-form-label">Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="xp-form-input"
                />
              </div>

              {/* Buttons row */}
              <div className="xp-button-row">
                <button onClick={() => onLogin(username, password)} className="xp-button xp-button-primary">
                  Login
                </button>
                <button onClick={onClose} className="xp-button">
                  Cancel
                </button>
                <button className="xp-button xp-button-small">
                  Shut Down...
                </button>
                <button className="xp-button xp-button-small">
                  Options &lt;&lt;
                </button>
              </div>
            </div>
          </div>
        </div>
    )
}