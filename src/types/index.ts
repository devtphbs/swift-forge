export interface Project {
  id: string
  name: string
  description?: string
  user_id: string
  created_at: string
  updated_at: string
  files: ProjectFile[]
  chats: ProjectChat[]
}

export interface ProjectFile {
  id: string
  project_id: string
  name: string
  content: string
  file_type: 'swift' | 'json' | 'plist' | 'other'
  created_at: string
  updated_at: string
}

export interface ProjectChat {
  id: string
  project_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface BuildLog {
  id: string
  project_id: string
  log_type: 'build' | 'export' | 'validation'
  content: string
  status: 'success' | 'error' | 'warning'
  created_at: string
}

export interface AppSubmission {
  id: string
  project_id: string
  app_store_id?: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  submission_data: any
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  tier: 'free' | 'pro'
  status: 'active' | 'cancelled' | 'expired'
  current_period_start: string
  current_period_end: string
}

export interface AppleCredentials {
  id: string
  user_id: string
  issuer_id: string
  key_id: string
  key_content: string
  created_at: string
}
