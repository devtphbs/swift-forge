'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import ChatPanel from './ChatPanel'
import CodeEditor from './CodeEditor'
import IPhonePreview from './iPhonePreview'
import Auth from './Auth'
import ProjectManager from './ProjectManager'
import { Project, ProjectFile } from '@/types'

export default function SwiftForgeLayout() {
  const [project, setProject] = useState<Project | null>(null)
  const [activeFile, setActiveFile] = useState<ProjectFile | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [showProjectManager, setShowProjectManager] = useState(false)

  const handleAuthChange = (user: User | null) => {
    setUser(user)
    if (!user) {
      setProject(null)
      setActiveFile(null)
      setShowProjectManager(false)
    }
  }

  const handleProjectSelect = (selectedProject: Project) => {
    setProject(selectedProject)
    setShowProjectManager(false)
    if (selectedProject.files && selectedProject.files.length > 0) {
      setActiveFile(selectedProject.files[0])
    }
  }

  const handleNewProject = () => {
    setShowProjectManager(false)
    // The project creation is handled in ProjectManager
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-gray-50'} text-white`}>
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">SF</span>
              </div>
              <h1 className="text-xl font-semibold">SwiftForge</h1>
            </div>
            {project && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>/</span>
                <span>{project.name}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            
            <Auth onAuthChange={handleAuthChange} />
            
            {user && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowProjectManager(!showProjectManager)}
                  className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {showProjectManager ? 'Editor' : 'Projects'}
                </button>
                <button className="px-3 py-1.5 text-sm border border-gray-700 hover:bg-gray-800 rounded-lg transition-colors">
                  Export
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      {!user ? (
        <div className="flex items-center justify-center h-[calc(100vh-60px)]">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <div className="h-16 w-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SF</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to SwiftForge</h2>
              <p className="text-gray-400">
                Build complete SwiftUI apps with AI. Sign in to get started.
              </p>
            </div>
          </div>
        </div>
      ) : showProjectManager ? (
        <div className="h-[calc(100vh-60px)] overflow-y-auto">
          <ProjectManager
            user={user}
            onProjectSelect={handleProjectSelect}
            onProjectCreate={handleNewProject}
          />
        </div>
      ) : (
        <div className="flex h-[calc(100vh-60px)] flex-col lg:flex-row">
          {/* Left: Chat Panel */}
          <div className="w-full lg:w-96 border-r border-gray-800 flex flex-col">
            <ChatPanel 
              project={project}
              onProjectUpdate={setProject}
              onFileUpdate={(file: ProjectFile) => setActiveFile(file)}
            />
          </div>

          {/* Center: Code Editor */}
          <div className="flex-1 flex flex-col border-r border-gray-800">
            <CodeEditor 
              activeFile={activeFile}
              project={project}
              onFileUpdate={setActiveFile}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Right: iPhone Preview */}
          <div className="w-full lg:w-96 flex flex-col">
            <IPhonePreview 
              files={project?.files || []}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      )}
    </div>
  )
}
