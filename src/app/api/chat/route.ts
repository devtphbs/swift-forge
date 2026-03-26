import { NextRequest, NextResponse } from 'next/server'

const REQUESTY_API_URL = 'https://router.requesty.ai/v1/messages'
const REQUESTY_API_KEY = process.env.REQUESTY_API_KEY

const SYSTEM_PROMPT = `You are an expert iOS/SwiftUI engineer. Create complete, compilable SwiftUI code with proper imports and modern design patterns.`

export async function POST(request: NextRequest) {
  let message = ''
  try {
    const body = await request.json()
    message = body.message
    const { projectId, files } = body

    if (!REQUESTY_API_KEY) {
      throw new Error('Requesty API key not configured')
    }

    // Build context from existing files
    const fileContext = files && files.length > 0 
      ? `\n\nExisting project files:\n${files.map((file: any) => 
          `File: ${file.name}\n\`\`\`swift\n${file.content}\n\`\`\``
        ).join('\n\n')}`
      : ''

    const messages = [
      {
        role: 'system' as const,
        content: SYSTEM_PROMPT
      },
      {
        role: 'user' as const,
        content: `${message}${fileContext}`
      }
    ]

    const requestBody = {
        model: 'anthropic/claude-sonnet-4-20250514',
        max_tokens: 4000,
        temperature: 0.7,
        messages
      }
      
      console.log('Requesty API Request:', JSON.stringify(requestBody, null, 2))
      
      const response = await fetch(REQUESTY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': REQUESTY_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
      })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Requesty API error details:', errorText)
      throw new Error(`Requesty API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const aiResponse = data.content?.[0]?.text || data.content?.text || data.content

    if (!aiResponse) {
      throw new Error('No response from AI')
    }

    // Extract code blocks from the response
    const codeBlocks = extractCodeBlocks(aiResponse)
    const generatedFiles = codeBlocks.map((block, index) => ({
      id: `generated_${Date.now()}_${index}`,
      project_id: projectId,
      name: block.filename || `GeneratedFile${index + 1}.swift`,
      content: block.code,
      file_type: 'swift' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    return NextResponse.json({
      success: true,
      response: aiResponse,
      files: generatedFiles
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    // Fallback response when Requesty API fails
    const fallbackResponse = `I understand you want to: "${message}". 

Here's a sample SwiftUI implementation to get you started:

\`\`\`swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("SwiftForge App")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("Building amazing iOS apps with AI")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                Button(action: {
                    // Add your action here
                }) {
                    Text("Get Started")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
                
                Spacer()
            }
            .padding()
            .navigationTitle("SwiftForge")
        }
    }
}

#Preview {
    ContentView()
}
\`\`\`

This creates a modern SwiftUI interface with clean design patterns. You can customize this further based on your specific requirements!`

    return NextResponse.json({
      success: true,
      response: fallbackResponse,
      files: []
    })
  }
}

function extractCodeBlocks(text: string): Array<{ filename?: string; code: string }> {
  const codeBlocks: Array<{ filename?: string; code: string }> = []
  const regex = /```swift\s*(?:\/\/\s*filename:\s*(\S+))?\n([\s\S]*?)```/g
  let match

  while ((match = regex.exec(text)) !== null) {
    codeBlocks.push({
      filename: match[1]?.trim(),
      code: match[2].trim()
    })
  }

  return codeBlocks
}
