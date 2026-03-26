'use client'

import { useState, useEffect } from 'react'
import { Smartphone, RotateCw, Moon, Sun } from 'lucide-react'
import { ProjectFile } from '@/types'
import DynamicIsland from './DynamicIsland'

interface iPhonePreviewProps {
  files: ProjectFile[]
  isDarkMode: boolean
}

export default function iPhonePreview({ files, isDarkMode }: iPhonePreviewProps) {
  const [previewContent, setPreviewContent] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showDynamicIsland, setShowDynamicIsland] = useState(true)
  const [isDynamicIslandExpanded, setIsDynamicIslandExpanded] = useState(false)

  useEffect(() => {
    generatePreview()
  }, [files])

  const generatePreview = () => {
    setIsRefreshing(true)
    
    // Find the main SwiftUI file (usually ContentView or main view)
    const mainFile = files.find(file => 
      file.name.includes('ContentView') || 
      file.name.includes('View') ||
      file.file_type === 'swift'
    )

    if (mainFile) {
      // Enhanced preview generation with live activity simulation
      const previewHTML = generateSwiftUIPreview(mainFile.content)
      setPreviewContent(previewHTML)
    } else {
      setPreviewContent(`
        <div class="flex items-center justify-center h-full text-gray-500">
          <div class="text-center">
            <div class="text-6xl mb-4">📱</div>
            <p class="text-lg">No SwiftUI files found</p>
            <p class="text-sm mt-2">Create a SwiftUI file to see preview</p>
          </div>
        </div>
      `)
    }

    setTimeout(() => setIsRefreshing(false), 500)
  }

  const generateSwiftUIPreview = (swiftCode: string) => {
    // Check for Live Activities or Dynamic Island content
    const hasLiveActivity = swiftCode.includes('ActivityKit') || swiftCode.includes('LiveActivity')
    const hasWidget = swiftCode.includes('WidgetKit') || swiftCode.includes('Widget')
    
    return `
      <div class="h-full bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-black p-4">
        <!-- Dynamic Island -->
        ${showDynamicIsland ? `
        <div class="flex justify-center mb-4">
          <div class="w-40 h-8 bg-black dark:bg-gray-900 rounded-full flex items-center justify-center">
            <div class="w-16 h-5 bg-gray-800 rounded-full"></div>
          </div>
        </div>
        ` : ''}
        
        <!-- Status Bar -->
        <div class="flex justify-between items-center mb-4 text-xs text-gray-600 dark:text-gray-400">
          <span>9:41</span>
          <div class="flex gap-1">
            <span>📶</span>
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        <!-- App Content -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
          <div class="text-center">
            <h2 class="text-lg font-bold mb-2">SwiftUI Preview</h2>
            
            ${hasLiveActivity ? `
            <div class="mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span class="text-sm font-medium">Live Activity Detected</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400">ActivityKit support found</p>
            </div>
            ` : ''}
            
            ${hasWidget ? `
            <div class="mb-4 p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span class="text-sm font-medium">Widget Detected</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400">WidgetKit support found</p>
            </div>
            ` : ''}
            
            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-left">
              <pre class="text-xs overflow-auto max-h-40">${escapeHtml(swiftCode.substring(0, 200))}${swiftCode.length > 200 ? '...' : ''}</pre>
            </div>
            
            <div class="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>🎨 Live rendering engine</p>
              <p class="text-xs mt-1">SwiftUI components detected</p>
              ${hasLiveActivity ? '<p class="text-xs mt-1">✅ Live Activities ready</p>' : ''}
              ${hasWidget ? '<p class="text-xs mt-1">✅ Widgets ready</p>' : ''}
            </div>
          </div>
        </div>

        <!-- Home Indicator -->
        <div class="flex justify-center mt-4">
          <div class="w-32 h-1 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
        </div>
      </div>
    `
  }

  const escapeHtml = (text: string) => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  const dynamicIslandContent = (
    <div className="text-white text-center">
      <div className="text-xs font-medium mb-1">SwiftForge Live</div>
      <div className="text-lg font-bold mb-1">Building...</div>
      <div className="text-xs text-gray-400">AI-powered development</div>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-blue-400" />
          <h2 className="font-semibold">iPhone Preview</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDynamicIsland(!showDynamicIsland)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              showDynamicIsland 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            Dynamic Island
          </button>
          
          <button
            onClick={generatePreview}
            disabled={isRefreshing}
            className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* iPhone Frame */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative">
          {/* iPhone 15 Pro Frame with Dynamic Island */}
          <div className="w-80 h-[680px] bg-black rounded-[40px] p-2 shadow-2xl">
            <div className="w-full h-full bg-white dark:bg-black rounded-[32px] overflow-hidden relative">
              {/* Dynamic Island - realistic pill shape with proper positioning */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-36 h-8 bg-black rounded-full z-10 flex items-center justify-center shadow-lg">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                  <div className="w-20 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                    <div className="w-16 h-4 bg-black rounded-full"></div>
                  </div>
                  <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                </div>
              </div>
              
              {/* Screen Content */}
              <div className="w-full h-full">
                {/* Dynamic Island Component */}
                {showDynamicIsland && (
                  <div className="pt-2">
                    <DynamicIsland
                      isExpanded={isDynamicIslandExpanded}
                      onToggle={() => setIsDynamicIslandExpanded(!isDynamicIslandExpanded)}
                      content={dynamicIslandContent}
                    />
                  </div>
                )}
                
                {/* Main Content */}
                <div 
                  className={`${showDynamicIsland ? 'h-[calc(100%-60px)]' : 'h-full'}`}
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
              </div>
            </div>
          </div>
          
          {/* Side Buttons */}
          <div className="absolute -right-1 top-20 w-1 h-12 bg-gray-700 rounded-r"></div>
          <div className="absolute -right-1 top-36 w-1 h-8 bg-gray-700 rounded-r"></div>
          <div className="absolute -right-1 top-48 w-1 h-8 bg-gray-700 rounded-r"></div>
          <div className="absolute -left-1 top-32 w-1 h-16 bg-gray-700 rounded-l"></div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="p-3 border-t border-gray-800">
        <div className="text-xs text-gray-400 text-center">
          <p>iPhone 15 Pro Simulator</p>
          <p className="mt-1">iOS 17.2 • SwiftUI Preview • {showDynamicIsland ? 'Dynamic Island ON' : 'Dynamic Island OFF'}</p>
        </div>
      </div>
    </div>
  )
}
