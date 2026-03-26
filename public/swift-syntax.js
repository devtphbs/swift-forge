// Swift syntax highlighting for Monaco Editor
(function(monaco) {
  // Register Swift language
  monaco.languages.register({ id: 'swift' });

  // Define Swift language tokens
  monaco.languages.setMonarchTokensProvider('swift', {
    // Swift keywords
    keywords: [
      'associatedtype', 'class', 'deinit', 'enum', 'extension', 'fileprivate',
      'func', 'import', 'init', 'inout', 'internal', 'let', 'open', 'operator',
      'private', 'protocol', 'public', 'rethrows', 'static', 'struct', 'subscript',
      'typealias', 'var', 'break', 'case', 'continue', 'default', 'defer',
      'do', 'else', 'fallthrough', 'for', 'guard', 'if', 'in', 'repeat',
      'return', 'switch', 'where', 'while', 'as', 'catch', 'is', 'super',
      'self', 'Self', 'throw', 'throws', 'try', 'throws', 'rethrows',
      'async', 'await', 'some', 'any'
    ],

    // SwiftUI specific keywords
    uiKeywords: [
      'View', 'State', 'Binding', 'EnvironmentObject', 'ObservedObject', 'StateObject',
      'Environment', 'FetchRequest', 'Section', 'ForEach', 'NavigationView',
      'TabView', 'VStack', 'HStack', 'ZStack', 'Text', 'Button', 'Image',
      'TextField', 'SecureField', 'Toggle', 'Slider', 'ProgressView',
      'ActivityIndicator', 'Spacer', 'Divider', 'Rectangle', 'Circle', 'Ellipse',
      'Capsule', 'RoundedRectangle', 'Color', 'LinearGradient', 'RadialGradient',
      'AngularGradient', 'ScrollView', 'List', 'Form', 'Alert', 'ActionSheet',
      'Sheet', 'FullScreenCover', 'Popover', 'ContextMenu', 'Menu', 'MenuButton',
      'Picker', 'DatePicker', 'Stepper', 'Label', 'Link', 'GroupBox', 'DisclosureGroup',
      'LazyVStack', 'LazyHStack', 'LazyVGrid', 'LazyHGrid', 'GridItem', 'TabItem',
      'ToolbarItem', 'Toolbar', 'NavigationView', 'NavigationLink', 'GeometryReader',
      'CoordinateSpace', 'PreferenceKey', 'AnchorPreference', 'ViewPreference',
      'TransformPreference', 'Shape', 'Path', 'ShapeStyle', 'InsettableShape',
      'ViewModifier', 'Animatable', 'AnimatableData', 'VectorArithmetic',
      'TimelineView', 'Canvas', 'SymbolEffect', 'HoverEffect', 'InteractiveDestination'
    ],

    // Built-in types
    builtinTypes: [
      'Int', 'Int8', 'Int16', 'Int32', 'Int64', 'UInt', 'UInt8', 'UInt16',
      'UInt32', 'UInt64', 'Float', 'Double', 'Bool', 'String', 'Character',
      'Array', 'Dictionary', 'Set', 'Optional', 'Result', 'URL', 'Data',
      'Date', 'UUID', 'Range', 'ClosedRange', 'CountableRange', 'CountableClosedRange',
      'CountablePartialRangeFrom', 'PartialRangeThrough', 'PartialRangeUpTo',
      'PartialRangeFrom', 'AnyObject', 'AnyClass', 'Any', 'Never', 'Void'
    ],

    // Attribute names
    attributes: [
      '@available', '@discardableResult', '@dynamicCallable', '@dynamicMemberLookup',
      '@escaping', '@frozen', '@GKInspectable', '@inlinable', '@main',
      '@nonobjc', '@NSApplicationMain', '@NSCopying', '@NSManaged', '@objc',
      '@objcMembers', '@propertyWrapper', '@resultBuilder', '@testable',
      '@UIApplicationMain', '@usableFromInline', '@warn_unqualified_access',
      '@State', '@Binding', '@EnvironmentObject', '@ObservedObject', '@StateObject',
      '@Environment', '@Published', '@AppStorage', '@SceneStorage', '@FetchRequest',
      '@ScaledMetric', '@Namespace', '@ViewBuilder', '@EnvironmentValue'
    ],

    operators: [
      '+', '-', '*', '/', '%', '=', '+=', '-=', '*=', '/=', '%=', '==', '!=',
      '===', '!==', '<', '<=', '>', '>=', '&&', '||', '!', '~', '&', '|', '^',
      '<<', '>>', '>>>', '??', '...', '..', '<.', '.*'
    ],

    // Symbols
    symbols: /[=><!~?:&|+\-*\/\^%]+/,

    // Escape sequences
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    // The main tokenizer for Swift
    tokenizer: {
      root: [
        // Strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/, 'string', '@string_double'],
        [/'''/, 'string', '@string_triple'],
        [/'[^\\']'/, 'string'],
        [/(')(@ident)/, ['string', 'string.invalid']],
        [/'/, 'string.invalid'],

        // Numbers
        [/\d*\.\d+([eE][\-+]?\d+)?[fFdD]?/, 'number.float'],
        [/0[xX][0-9a-fA-F]+/, 'number.hex'],
        [/\d+/, 'number'],

        // Identifiers
        [/[a-zA-Z_][\w$]*/, {
          cases: {
            '@keywords': 'keyword',
            '@uiKeywords': 'keyword.control',
            '@builtinTypes': 'type',
            '@attributes': 'keyword.control',
            '@default': 'identifier'
          }
        }],

        // Whitespace
        { include: '@whitespace' },

        // Delimiters and operators
        [/[{}()\[\]]/, '@brackets'],
        [/[<>](?!@symbols)/, '@brackets'],
        [/@symbols/, {
          cases: {
            '@operators': 'operator',
            '@default': ''
          }
        }]
      ],

      // String states
      string_double: [
        [/[^\\"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"/, 'string', '@pop']
      ],

      string_triple: [
        [/[^']+/, 'string'],
        [/'''/, 'string', '@pop']
      ],

      // Whitespace
      whitespace: [
        [/[ \t\r\n]+/, 'white'],
        [/\/\/.*$/, 'comment'],
        [/\/\*/, 'comment', '@comment'],
        [/#.*$/, 'comment']
      ],

      // Comment state
      comment: [
        [/[^\/*]+/, 'comment'],
        [/\/\*/, 'comment.invalid'],
        [/\*\//, 'comment', '@pop'],
        [/[\/*]/, 'comment']
      ]
    }
  });

  // Configure Swift language options
  monaco.languages.setLanguageConfiguration('swift', {
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/']
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')']
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ]
  });

  // Set theme for Swift
  monaco.editor.defineTheme('swift-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'ff79c6' },
      { token: 'keyword.control', foreground: '8be9fd' },
      { token: 'type', foreground: 'ff79c6' },
      { token: 'string', foreground: 'f1fa8c' },
      { token: 'string.escape', foreground: '50fa7b' },
      { token: 'number', foreground: 'bd93f9' },
      { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
      { token: 'operator', foreground: 'ff79c6' },
      { token: 'identifier', foreground: 'f8f8f2' },
      { token: 'brackets', foreground: 'f8f8f2' }
    ],
    colors: {
      'editor.background': '#282a36',
      'editor.foreground': '#f8f8f2',
      'editor.lineHighlightBackground': '#44475a',
      'editorCursor.foreground': '#f8f8f2',
      'editorWhitespace.foreground': '#6272a4'
    }
  });

  monaco.editor.defineTheme('swift-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'd73a49' },
      { token: 'keyword.control', foreground: '032f62' },
      { token: 'type', foreground: 'd73a49' },
      { token: 'string', foreground: '032f62' },
      { token: 'string.escape', foreground: '22863a' },
      { token: 'number', foreground: '005cc5' },
      { token: 'comment', foreground: '#6a737d', fontStyle: 'italic' },
      { token: 'operator', foreground: 'd73a49' },
      { token: 'identifier', foreground: '#24292e' },
      { token: 'brackets', foreground: '#24292e' }
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#24292e',
      'editor.lineHighlightBackground': '#f6f8fa',
      'editorCursor.foreground': '#044289',
      'editorWhitespace.foreground': '#d1d5da'
    }
  });
})(self.monaco);
