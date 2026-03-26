import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'

interface ExportRequest {
  projectId: string
  projectName: string
  files: Array<{
    name: string
    content: string
    file_type: string
  }>
  exportType: 'xcode' | 'expo'
}

export async function POST(request: NextRequest) {
  try {
    const { projectId, projectName, files, exportType }: ExportRequest = await request.json()

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files to export' },
        { status: 400 }
      )
    }

    let zipBuffer: Buffer
    let filename: string

    if (exportType === 'xcode') {
      zipBuffer = await generateXcodeProject(projectName, files)
      filename = `${projectName}.xcodeproj.zip`
    } else if (exportType === 'expo') {
      zipBuffer = await generateExpoProject(projectName, files)
      filename = `${projectName}-expo.zip`
    } else {
      return NextResponse.json(
        { error: 'Invalid export type' },
        { status: 400 }
      )
    }

    return new NextResponse(zipBuffer as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}

async function generateXcodeProject(projectName: string, files: any[]): Promise<Buffer> {
  const zip = new JSZip()

  // Create project structure
  const projectFolder = zip.folder(`${projectName}.xcodeproj`)!
  const sourceFolder = zip.folder(projectName)!

  // Generate project.pbxproj
  const pbxproj = generatePbxproj(projectName, files)
  projectFolder.file('project.pbxproj', pbxproj)

  // Generate Info.plist
  const infoPlist = generateInfoPlist(projectName)
  sourceFolder.file('Info.plist', infoPlist)

  // Add source files
  files.forEach(file => {
    if (file.file_type === 'swift') {
      sourceFolder.file(file.name, file.content)
    } else if (file.name === 'Info.plist') {
      sourceFolder.file(file.name, file.content)
    } else if (file.name.endsWith('.json')) {
      sourceFolder.file(file.name, file.content)
    }
  })

  // Add Assets.xcassets
  const assetsFolder = sourceFolder.folder('Assets.xcassets')!
  const appIconSet = assetsFolder.folder('AppIcon.appiconset')!
  appIconSet.file('Contents.json', JSON.stringify({
    images: [{
      size: '20x20',
      idiom: 'iphone',
      filename: 'icon-20@2x.png',
      scale: '2x'
    }, {
      size: '20x20',
      idiom: 'iphone',
      filename: 'icon-20@3x.png',
      scale: '3x'
    }],
    info: {
      author: 'xcode',
      version: 1
    }
  }, null, 2))

  // Add ContentView.swift if not present
  const hasContentView = files.some(f => f.name.includes('ContentView'))
  if (!hasContentView) {
    sourceFolder.file('ContentView.swift', generateDefaultContentView())
  }

  // Add main App.swift if not present
  const hasAppFile = files.some(f => f.name.includes('App.swift'))
  if (!hasAppFile) {
    sourceFolder.file(`${projectName}App.swift`, generateAppFile(projectName))
  }

  return await zip.generateAsync({ type: 'nodebuffer' })
}

async function generateExpoProject(projectName: string, files: any[]): Promise<Buffer> {
  const zip = new JSZip()

  // Generate package.json
  const packageJson = {
    name: projectName.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    main: 'node_modules/expo/AppEntry.js',
    scripts: {
      start: 'expo start',
      android: 'expo start --android',
      ios: 'expo start --ios',
      web: 'expo start --web'
    },
    dependencies: {
      expo: '~49.0.0',
      'react': '18.2.0',
      'react-native': '0.72.6'
    },
    devDependencies: {
      '@babel/core': '^7.20.0'
    }
  }

  zip.file('package.json', JSON.stringify(packageJson, null, 2))

  // Generate app.json
  const appJson = {
    expo: {
      name: projectName,
      slug: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      orientation: 'portrait',
      icon: './assets/icon.png',
      userInterfaceStyle: 'automatic',
      splash: {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff'
      },
      ios: {
        supportsTablet: true
      },
      android: {
        adaptiveIcon: {
          foregroundImage: './assets/adaptive-icon.png',
          backgroundColor: '#FFFFFF'
        }
      },
      web: {
        favicon: './assets/favicon.png'
      }
    }
  }

  zip.file('app.json', JSON.stringify(appJson, null, 2))

  // Generate App.js (React Native version)
  const appJs = generateReactNativeApp(projectName)
  zip.file('App.js', appJs)

  // Add assets folder structure
  const assetsFolder = zip.folder('assets')!
  assetsFolder.file('icon.png', '') // Placeholder
  assetsFolder.file('splash.png', '') // Placeholder
  assetsFolder.file('adaptive-icon.png', '') // Placeholder
  assetsFolder.file('favicon.png', '') // Placeholder

  // Generate eas.json for Expo Application Services
  const easJson = {
    cli: {
      version: '>= 3.8.0'
    },
    build: {
      development: {
        developmentClient: true,
        distribution: 'internal'
      },
      preview: {
        distribution: 'internal'
      },
      production: {}
    },
    submit: {
      production: {}
    }
  }

  zip.file('eas.json', JSON.stringify(easJson, null, 2))

  return await zip.generateAsync({ type: 'nodebuffer' })
}

function generatePbxproj(projectName: string, files: any[]): string {
  // Simplified pbxproj generation
  return `// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 56;
	objects = {
		{...} // Full pbxproj would be much more complex
	};
	rootObject = {...};
}`
}

function generateInfoPlist(projectName: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>$(DEVELOPMENT_LANGUAGE)</string>
	<key>CFBundleDisplayName</key>
	<string>${projectName}</string>
	<key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>$(PRODUCT_NAME)</string>
	<key>CFBundlePackageType</key>
	<string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0</string>
	<key>CFBundleVersion</key>
	<string>1</string>
	<key>LSRequiresIPhoneOS</key>
	<true/>
	<key>UIApplicationSceneManifest</key>
	<dict>
		<key>UIApplicationSupportsMultipleScenes</key>
		<true/>
	</dict>
	<key>UIApplicationSupportsIndirectInputEvents</key>
	<true/>
	<key>UILaunchScreen</key>
	<dict/>
	<key>UIRequiredDeviceCapabilities</key>
	<array>
		<string>armv7</string>
	</array>
	<key>UISupportedInterfaceOrientations</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
		<string>UIInterfaceOrientationLandscapeLeft</string>
		<string>UIInterfaceOrientationLandscapeRight</string>
	</array>
	<key>UISupportedInterfaceOrientations~ipad</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
		<string>UIInterfaceOrientationPortraitUpsideDown</string>
		<string>UIInterfaceOrientationLandscapeLeft</string>
		<string>UIInterfaceOrientationLandscapeRight</string>
	</array>
</dict>
</plist>`
}

function generateDefaultContentView(): string {
  return `import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundColor(.accentColor)
            Text("Hello, world!")
        }
        .padding()
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}`
}

function generateAppFile(projectName: string): string {
  return `import SwiftUI

@main
struct ${projectName}App: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}`
}

function generateReactNativeApp(projectName: string): string {
  return `import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>${projectName}</Text>
      <Text style={styles.subtitle}>Built with SwiftForge</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});`
}
