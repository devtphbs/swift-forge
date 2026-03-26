import { NextRequest, NextResponse } from 'next/server'

const REQUESTY_API_URL = 'https://api.requesty.ai/v1/chat/completions'
const REQUESTY_API_KEY = process.env.REQUESTY_API_KEY

const SYSTEM_PROMPT = `You are an expert iOS/SwiftUI engineer with deep knowledge of Apple's latest frameworks and best practices. You specialize in creating complete, production-ready SwiftUI applications.

Your capabilities include:
- SwiftUI views and layouts with modern design patterns
- SwiftData and Core Data integration
- ActivityKit for Live Activities
- WidgetKit for home screen widgets
- Dynamic Island implementations with advanced interactions
- Combine framework for reactive programming
- Swift Concurrency (async/await)
- iOS 26 features and latest APIs
- Apple Intelligence integration and liquid glass UI effects
- Vision Pro and spatial computing concepts
- App Store Connect best practices
- Xcode project structure and optimization

When generating code:
1. Always provide complete, compilable SwiftUI code
2. Include proper imports and struct definitions
3. Follow Swift naming conventions
4. Add comments for complex logic
5. Consider performance and memory management
6. Include error handling where appropriate
7. Use modern SwiftUI syntax (iOS 15+)
8. Incorporate Apple Intelligence features when relevant
9. Use liquid glass effects and modern iOS design patterns
10. Leverage Dynamic Island for interactive experiences

Format your responses with clear code blocks using swift syntax highlighting.
If multiple files are needed, clearly indicate the filename for each code block.`

export async function POST(request: NextRequest) {
  try {
    const { message, projectId, files } = await request.json()

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

    const response = await fetch(REQUESTY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${REQUESTY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        messages,
        max_tokens: 4000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`Requesty API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content

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
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
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
