// ============================================
// KirinGo 类型定义
// ============================================

export type UserRole = 'jobseeker' | 'recruiter'

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string
  role: UserRole
  phone?: string
  city: string
  bio?: string
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  recruiter_id: string
  name: string
  logo_url: string
  industry: string
  scale: string
  financing: string
  city: string
  address: string
  description: string
  website: string
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  recruiter_id: string
  company_id: string
  title: string
  description: string
  requirements: string
  city: string
  district: string
  salary_min: number
  salary_max: number
  experience: string
  education: string
  job_type: string
  tags: string[]
  status: 'active' | 'closed' | 'draft'
  view_count: number
  created_at: string
  updated_at: string
  // 关联
  company?: Company
  recruiter?: Profile
}

export interface ResumeBasicInfo {
  name: string
  gender: string
  age: number
  birthday: string
  phone: string
  email: string
  city: string
  github: string
  website: string
}

export interface ResumeEducation {
  school: string
  degree: string
  major: string
  start: string
  end: string
}

export interface ResumeExperience {
  company: string
  position: string
  start: string
  end: string
  description: string
}

export interface ResumeProject {
  name: string
  role: string
  description: string
  start: string
  end: string
}

export interface ResumeAISuggestion {
  category: string
  original: string
  optimized: string
  reason: string
}

export interface Resume {
  id: string
  user_id: string
  title: string
  file_url: string
  basic_info: ResumeBasicInfo
  education: ResumeEducation[]
  experience: ResumeExperience[]
  skills: string[]
  projects: ResumeProject[]
  certificates: string[]
  self_evaluation: string
  ai_optimized_content: string
  ai_score: number
  ai_suggestions: ResumeAISuggestion[]
  is_default: boolean
  created_at: string
  updated_at: string
}

export type ApplicationStatus = 'pending' | 'viewed' | 'interview' | 'offer' | 'rejected' | 'withdrawn'

export interface Application {
  id: string
  job_id: string
  user_id: string
  recruiter_id: string
  resume_id: string | null
  status: ApplicationStatus
  ai_match_score: number
  ai_match_detail: Record<string, any>
  cover_letter: string
  created_at: string
  updated_at: string
  // 关联
  job?: Job
  resume?: Resume
  user?: Profile
}

export interface Conversation {
  id: string
  jobseeker_id: string
  recruiter_id: string
  job_id: string | null
  last_message: string
  last_message_at: string
  jobseeker_unread: number
  recruiter_unread: number
  created_at: string
  // 关联
  jobseeker?: Profile
  recruiter?: Profile
  job?: Job
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'file' | 'system'
  is_read: boolean
  created_at: string
}

export interface InterviewMessage {
  role: 'ai' | 'user'
  content: string
  timestamp?: string
}

export interface Interview {
  id: string
  user_id: string
  job_id: string | null
  job_title: string
  status: 'active' | 'completed' | 'cancelled'
  messages: InterviewMessage[]
  ai_feedback: Record<string, any>
  ai_score: number
  created_at: string
  updated_at: string
}

// AI 相关类型
export interface AIMatchResult {
  score: number
  dimensions: {
    skills: number
    experience: number
    education: number
    location: number
  }
  strengths: string[]
  gaps: string[]
  suggestions: string[]
}

export interface AIResumeOptimization {
  optimized_content: string
  score: number
  suggestions: {
    category: string
    original: string
    optimized: string
    reason: string
  }[]
}

export interface ToastItem {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}
