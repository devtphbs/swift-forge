'use client'

import { useState, useEffect } from 'react'

interface DynamicIslandProps {
  isExpanded: boolean
  onToggle: () => void
  content?: React.ReactNode
}

export default function DynamicIsland({ isExpanded, onToggle, content }: DynamicIslandProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 300)
    return () => clearTimeout(timer)
  }, [isExpanded])

  return (
    <div className="flex justify-center mb-4">
      <div 
        onClick={onToggle}
        className={`
          relative bg-black dark:bg-gray-900 rounded-full cursor-pointer
          transition-all duration-300 ease-in-out overflow-hidden
          ${isExpanded ? 'w-64 h-32' : 'w-40 h-8'}
          ${isAnimating ? 'scale-105' : 'scale-100'}
        `}
      >
        {/* Default state - pill shape */}
        {!isExpanded && (
          <div className="flex items-center justify-center h-full">
            <div className="w-16 h-5 bg-gray-800 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            </div>
          </div>
        )}

        {/* Expanded state */}
        {isExpanded && (
          <div className="p-4 h-full flex flex-col justify-center">
            {content || (
              <div className="text-white text-center">
                <div className="text-xs font-medium mb-1">Live Activity</div>
                <div className="text-2xl font-bold mb-1">23:45</div>
                <div className="text-xs text-gray-400">Uber • 5 min away</div>
                <div className="mt-2 flex justify-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🚗</span>
                  </div>
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">📍</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none"></div>
      </div>
    </div>
  )
}
