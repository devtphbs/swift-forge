# SwiftForge - AI-Powered iOS App Builder

SwiftForge is a production-ready, AI-powered web application that enables users to build complete SwiftUI apps through natural language conversation. Similar to Lovable but specialized for Apple ecosystem development.

## 🚀 Features

### Core Functionality
- **AI Chat Interface**: Chat with AI (Claude Sonnet 4.5 via Requesty API) to generate complete SwiftUI apps
- **3-Panel Editor UI**: Lovable-style interface with chat, code editor, and iPhone preview
- **Live Preview Engine**: Web-based iPhone simulator with Dynamic Island support
- **Swift Syntax Highlighting**: Monaco Editor with custom Swift syntax highlighting
- **Project Management**: Create, manage, and organize multiple projects

### Advanced Features
- **SwiftUI Syntax Validator**: Real-time code validation with error detection
- **Xcode Project Export**: Generate complete .xcodeproj files for download
- **Live Activities Support**: ActivityKit integration for dynamic content
- **Dynamic Island Templates**: Ready-to-use Dynamic Island components
- **Widget Development**: WidgetKit support for home screen widgets
- **Multi-Device Sync**: Real-time synchronization across devices

### Platform Integration
- **Authentication**: Supabase Auth with Google OAuth support
- **Database**: Supabase PostgreSQL with Row Level Security
- **Subscription Management**: RevenueCat integration (simulated)
- **App Store Connect**: API integration for direct app submission

## 🛠 Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Monaco Editor** for code editing
- **Lucide React** for icons

### Backend
- **Next.js API Routes**
- **Supabase** for database and auth
- **Requesty API** (Claude Sonnet 4.5) for AI
- **JSZip** for project bundling

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd swift-forge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Configure the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   REQUESTY_API_KEY=your_requesty_api_key
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql`
   - Configure authentication providers (Email, Google)

5. **Start the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎯 Usage

### Getting Started
1. Sign up or sign in with your email or Google account
2. Create a new project from the project manager
3. Start chatting with the AI to build your SwiftUI app

### AI Chat Prompts
- "Create a SwiftUI app with a login screen"
- "Add a widget that shows the weather"
- "Implement Live Activities for a delivery app"
- "Add Dynamic Island support for music playback"

### Code Editor Features
- Swift syntax highlighting with custom themes
- Real-time syntax validation
- Multi-file support with tabs
- Auto-completion and error detection

### Export Options
- **Xcode Project**: Complete .xcodeproj with source files
- **Expo Project**: React Native alternative (experimental)

## 🔧 Development

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── chat/          # AI chat endpoint
│   │   ├── validate/      # Code validation
│   │   ├── export/        # Project export
│   │   └── subscription/  # Subscription management
│   └── auth/              # Authentication callbacks
├── components/            # React components
│   ├── SwiftForgeLayout.tsx
│   ├── ChatPanel.tsx
│   ├── CodeEditor.tsx
│   ├── iPhonePreview.tsx
│   ├── Auth.tsx
│   ├── ProjectManager.tsx
│   └── SubscriptionManager.tsx
├── lib/                   # Utility functions
├── types/                 # TypeScript definitions
└── public/               # Static assets
```

## 🎨 Design System

SwiftForge uses a modern, dark-first design inspired by development tools:
- **Color Palette**: Black/gray backgrounds with blue accent colors
- **Typography**: Clean, readable fonts with proper hierarchy
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Works on desktop and tablet devices

## 🔐 Security

- **Row Level Security**: All database tables have RLS policies
- **API Key Protection**: Environment variables for sensitive keys
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 📱 Supported Features

### SwiftUI Components
- Views and layouts (VStack, HStack, ZStack)
- Navigation (NavigationView, TabView)
- Input controls (TextField, Button, Toggle)
- Lists and data display
- Animations and transitions

### iOS Features
- **Live Activities**: ActivityKit integration
- **Dynamic Island**: Interactive content
- **Widgets**: Home screen widgets
- **Push Notifications**: Ready for integration
- **App Store Connect**: Direct submission support

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Self-Hosting
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for the iOS development community
