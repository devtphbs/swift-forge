import { NextRequest, NextResponse } from 'next/server'

interface ValidationResult {
  valid: boolean
  errors: Array<{
    line?: number
    type: 'syntax' | 'import' | 'deprecated' | 'warning'
    message: string
    severity: 'error' | 'warning' | 'info'
  }>
  suggestions: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { code, filename } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }

    const result = validateSwiftCode(code, filename)
    
    return NextResponse.json({
      success: true,
      validation: result
    })

  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}

function validateSwiftCode(code: string, filename?: string): ValidationResult {
  const errors: ValidationResult['errors'] = []
  const suggestions: string[] = []

  // Basic syntax checks
  const lines = code.split('\n')

  lines.forEach((line, index) => {
    const lineNumber = index + 1
    const trimmedLine = line.trim()

    // Check for missing imports
    if (trimmedLine.includes('UIV') && !code.includes('import SwiftUI')) {
      errors.push({
        line: lineNumber,
        type: 'import',
        message: 'Missing import SwiftUI',
        severity: 'error'
      })
      suggestions.push('Add import SwiftUI at the top of the file')
    }

    // Check for ActivityKit usage without import
    if (trimmedLine.includes('ActivityKit') && !code.includes('import ActivityKit')) {
      errors.push({
        line: lineNumber,
        type: 'import',
        message: 'Missing import ActivityKit for Live Activities',
        severity: 'error'
      })
      suggestions.push('Add import ActivityKit at the top of the file')
    }

    // Check for WidgetKit usage without import
    if (trimmedLine.includes('WidgetKit') && !code.includes('import WidgetKit')) {
      errors.push({
        line: lineNumber,
        type: 'import',
        message: 'Missing import WidgetKit for widgets',
        severity: 'error'
      })
      suggestions.push('Add import WidgetKit at the top of the file')
    }

    // Check for force unwrapping warnings
    if (trimmedLine.includes('!') && !trimmedLine.includes('//')) {
      errors.push({
        line: lineNumber,
        type: 'warning',
        message: 'Force unwrapping detected - consider using optional binding or guard let',
        severity: 'warning'
      })
      suggestions.push('Consider using optional binding (if let) or guard let instead of force unwrapping')
    }

    // Check for deprecated APIs
    if (trimmedLine.includes('.alert(') && !trimmedLine.includes('Button(')) {
      errors.push({
        line: lineNumber,
        type: 'deprecated',
        message: 'Legacy alert API detected - consider using .alert(item:) or .alert(isPresented:)',
        severity: 'warning'
      })
      suggestions.push('Update to modern SwiftUI alert API')
    }

    // Basic syntax validation
    if (trimmedLine.includes('struct ') && !trimmedLine.includes('{')) {
      errors.push({
        line: lineNumber,
        type: 'syntax',
        message: 'Struct declaration missing opening brace',
        severity: 'error'
      })
    }

    if (trimmedLine.includes('var body: some View') && !trimmedLine.includes('{')) {
      errors.push({
        line: lineNumber,
        type: 'syntax',
        message: 'View body missing opening brace',
        severity: 'error'
      })
    }
  })

  // Check for balanced braces
  const openBraces = (code.match(/{/g) || []).length
  const closeBraces = (code.match(/}/g) || []).length
  
  if (openBraces !== closeBraces) {
    errors.push({
      type: 'syntax',
      message: `Unbalanced braces: ${openBraces} opening, ${closeBraces} closing`,
      severity: 'error'
    })
  }

  // Check for balanced parentheses
  const openParens = (code.match(/\(/g) || []).length
  const closeParens = (code.match(/\)/g) || []).length
  
  if (openParens !== closeParens) {
    errors.push({
      type: 'syntax',
      message: `Unbalanced parentheses: ${openParens} opening, ${closeParens} closing`,
      severity: 'error'
    })
  }

  // SwiftUI-specific checks
  if (code.includes('View') && !code.includes('some View')) {
    errors.push({
      type: 'syntax',
      message: 'View body should return some View',
      severity: 'warning'
    })
    suggestions.push('Change return type to "some View" for better performance')
  }

  // Check for proper file structure
  if (filename?.endsWith('.swift')) {
    if (!code.includes('import') && code.includes('View')) {
      suggestions.push('Add appropriate imports at the top of the file')
    }
  }

  const valid = errors.filter(e => e.severity === 'error').length === 0

  return {
    valid,
    errors,
    suggestions
  }
}
