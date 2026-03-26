'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Code, Smartphone, Package, Activity } from 'lucide-react'
import { Project, ProjectChat, ProjectFile } from '@/types'

interface ChatPanelProps {
  project: Project | null
  onProjectUpdate: (project: Project) => void
  onFileUpdate: (file: ProjectFile) => void
}

const promptChips = [
  { icon: Code, text: 'Create App', prompt: 'Create a SwiftUI app with modern design and animations' },
  { icon: Package, text: 'Custom Button', prompt: 'Create a modern button with liquid glass effects and animations' },
  { icon: Activity, text: 'Task Manager', prompt: 'Create a complete task management app with SwiftData' },
  { icon: Smartphone, text: 'Dynamic Island', prompt: 'Create an interactive Dynamic Island experience' },
  { icon: Sparkles, text: 'Apple Intelligence', prompt: 'Integrate Apple Intelligence features with modern UI' }
]

export default function ChatPanel({ project, onProjectUpdate, onFileUpdate }: ChatPanelProps) {
  const [messages, setMessages] = useState<ProjectChat[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: ProjectChat = {
      id: Date.now().toString(),
      project_id: project?.id || '',
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          projectId: project?.id,
          files: project?.files || []
        })
      })

      const data = await response.json()
      
      if (data.success) {
        const assistantMessage: ProjectChat = {
          id: (Date.now() + 1).toString(),
          project_id: project?.id || '',
          role: 'assistant',
          content: data.response,
          created_at: new Date().toISOString()
        }

        setMessages(prev => [...prev, assistantMessage])

        // Update project with new files if any
        if (data.files && data.files.length > 0) {
          onFileUpdate(data.files[0])
        }
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ProjectChat = {
        id: (Date.now() + 1).toString(),
        project_id: project?.id || '',
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-400" />
          <h2 className="font-semibold">AI Assistant</h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="mb-4">
              <div className="h-12 w-12 mx-auto bg-blue-600 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Start building your iOS app</h3>
            <p className="text-gray-400 text-sm mb-6">
              Chat with AI to generate SwiftUI code, add features, and export your app
            </p>
            
            {/* Prompt Chips */}
            <div className="grid grid-cols-1 gap-2 max-w-xs mx-auto">
              {promptChips.map((chip, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(chip.prompt)}
                  className="flex items-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors text-left"
                >
                  <chip.icon className="h-4 w-4 text-blue-400" />
                  <span>{chip.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                <span className="text-sm text-gray-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your iOS app..."
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
