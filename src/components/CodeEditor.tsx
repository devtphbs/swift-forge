'use client'

import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { FileText, Plus, X } from 'lucide-react'
import { ProjectFile } from '@/types'

interface CodeEditorProps {
  activeFile: ProjectFile | null
  project: any
  onFileUpdate: (file: ProjectFile) => void
  isDarkMode: boolean
}

export default function CodeEditor({ activeFile, project, onFileUpdate, isDarkMode }: CodeEditorProps) {
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [openTabs, setOpenTabs] = useState<string[]>([])

  useEffect(() => {
    if (project?.files) {
      setFiles(project.files)
      if (project.files.length > 0 && !activeFile) {
        onFileUpdate(project.files[0])
        setOpenTabs([project.files[0].id])
      }
    }
  }, [project, activeFile, onFileUpdate])

  const handleFileChange = (content: string | undefined) => {
    if (activeFile && content !== undefined) {
      const updatedFile = { ...activeFile, content }
      onFileUpdate(updatedFile)
      
      // Update files array
      setFiles(prev => 
        prev.map(file => 
          file.id === activeFile.id ? updatedFile : file
        )
      )
    }
  }

  const openFile = (file: ProjectFile) => {
    onFileUpdate(file)
    if (!openTabs.includes(file.id)) {
      setOpenTabs(prev => [...prev, file.id])
    }
  }

  const closeTab = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenTabs(prev => prev.filter(id => id !== fileId))
    if (activeFile?.id === fileId) {
      const remainingTabs = openTabs.filter(id => id !== fileId)
      if (remainingTabs.length > 0) {
        const nextFile = files.find(f => f.id === remainingTabs[0])
        if (nextFile) openFile(nextFile)
      }
    }
  }

  const createNewFile = () => {
    const newFile: ProjectFile = {
      id: Date.now().toString(),
      project_id: project?.id || '',
      name: 'NewFile.swift',
      content: '// New SwiftUI file\nimport SwiftUI\n\nstruct NewView: View {\n    var body: some View {\n        Text(\"Hello World\")\n    }\n}',
      file_type: 'swift',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setFiles(prev => [...prev, newFile])
    openFile(newFile)
  }

  const getFileLanguage = (fileType: string) => {
    switch (fileType) {
      case 'swift': return 'swift'
      case 'json': return 'json'
      default: return 'plaintext'
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={createNewFile}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            New File
          </button>
          
          {files.length > 0 && (
            <select
              value={activeFile?.id || ''}
              onChange={(e) => {
                const file = files.find(f => f.id === e.target.value)
                if (file) openFile(file)
              }}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              {files.map(file => (
                <option key={file.id} value={file.id}>
                  {file.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {activeFile && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FileText className="h-4 w-4" />
            <span>{activeFile.name}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      {openTabs.length > 0 && (
        <div className="flex items-center gap-1 p-2 border-b border-gray-800 overflow-x-auto">
          {openTabs.map(tabId => {
            const file = files.find(f => f.id === tabId)
            if (!file) return null
            
            return (
              <div
                key={tabId}
                onClick={() => openFile(file)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg cursor-pointer transition-colors ${
                  activeFile?.id === tabId
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-950 text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-sm">{file.name}</span>
                <button
                  onClick={(e) => closeTab(tabId, e)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1">
        {activeFile ? (
          <Editor
            height="100%"
            language={getFileLanguage(activeFile.file_type)}
            value={activeFile.content}
            onChange={handleFileChange}
            theme={isDarkMode ? 'swift-dark' : 'swift-light'}
            beforeMount={(monaco) => {
              // Ensure Swift language is registered
              if (typeof window !== 'undefined' && (window as any).monaco) {
                monaco.languages.register({ id: 'swift' })
              }
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              insertSpaces: true,
              wordWrap: 'on',
              bracketPairColorization: { enabled: true },
              guides: {
                bracketPairs: true,
                indentation: true
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No file selected</p>
              <p className="text-sm mt-2">Create a new file or select one from the dropdown</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
