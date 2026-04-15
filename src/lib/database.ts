import { supabase } from './supabase'
import type {
  Application,
  ApplicationStatus,
  Company,
  Conversation,
  Interview,
  Job,
  Message,
  Profile,
  Resume,
  UserRole,
} from '@/types'

const PLACEHOLDER_URL = 'https://your-project.supabase.co'
const PLACEHOLDER_ANON_KEY = 'your-anon-key'

export const isSupabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL)
  && import.meta.env.VITE_SUPABASE_URL !== PLACEHOLDER_URL
  && Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)
  && import.meta.env.VITE_SUPABASE_ANON_KEY !== PLACEHOLDER_ANON_KEY

type AuthUserLike = {
  id: string
  email?: string | null
  user_metadata?: Record<string, unknown> | null
}

type ProfileStats = {
  summaryCards: Array<{ label: string; value: string }>
  quickEntryCounts: {
    applications: number
    conversations: number
    jobs: number
    interviews: number
  }
}

function ensureConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase 尚未配置，无法使用真实数据库。请检查 .env 中的 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。')
  }
}

function normalizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '-')
}

function isNotFoundError(error: { code?: string } | null) {
  return error?.code === 'PGRST116'
}

export async function fetchProfileById(id: string) {
  ensureConfigured()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error && !isNotFoundError(error)) {
    throw error
  }

  return (data as Profile | null) ?? null
}

export async function ensureProfile(authUser: AuthUserLike) {
  ensureConfigured()

  const existing = await fetchProfileById(authUser.id)
  if (existing) {
    return existing
  }

  const fullName = String(authUser.user_metadata?.full_name || '')
  const role = (authUser.user_metadata?.role as UserRole | undefined) || 'jobseeker'

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: authUser.id,
      email: authUser.email || '',
      full_name: fullName,
      role,
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data as Profile
}

export async function fetchJobs() {
  ensureConfigured()

  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      company:companies(*),
      recruiter:profiles(*)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as Job[]
}

export async function fetchJobById(id: string) {
  ensureConfigured()

  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      company:companies(*),
      recruiter:profiles(*)
    `)
    .eq('id', id)
    .maybeSingle()

  if (error && !isNotFoundError(error)) {
    throw error
  }

  return (data as Job | null) ?? null
}

export async function fetchRecruiterJobs(recruiterId: string) {
  ensureConfigured()

  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('recruiter_id', recruiterId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as Job[]
}

export async function createJob(jobData: Partial<Job>) {
  ensureConfigured()

  const { data, error } = await supabase
    .from('jobs')
    .insert(jobData)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data as Job
}

export async function updateJob(id: string, updates: Partial<Job>) {
  ensureConfigured()

  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data as Job
}

export async function deleteJob(id: string) {
  ensureConfigured()

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}

export async function fetchCompanyByRecruiter(recruiterId: string) {
  ensureConfigured()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('recruiter_id', recruiterId)
    .maybeSingle()

  if (error && !isNotFoundError(error)) {
    throw error
  }

  return (data as Company | null) ?? null
}

export async function updateCompany(id: string, updates: Partial<Company>) {
  ensureConfigured()

  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data as Company
}

export async function fetchCompanies(limit = 8) {
  ensureConfigured()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw error
  }

  return (data ?? []) as Company[]
}

export async function fetchHomeStats() {
  ensureConfigured()

  const tables = ['jobs', 'companies', 'profiles', 'applications'] as const
  const results = await Promise.all(
    tables.map(table => {
      let query = supabase.from(table).select('*', { count: 'exact', head: true })
      if (table === 'jobs') query = query.eq('status', 'active')
      return query
    })
  )

  const errors = results.map(r => r.error).filter(Boolean)
  if (errors.length > 0) throw errors[0]

  const [jobsCount, companiesCount, usersCount, applicationsCount] = results.map(r => r.count ?? 0)

  return [
    { value: String(jobsCount), label: '在招职位' },
    { value: String(companiesCount), label: '合作企业' },
    { value: String(usersCount), label: '注册用户' },
    { value: String(applicationsCount), label: '累计投递' },
  ]
}

export async function fetchUserResume(userId: string) {
  ensureConfigured()

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error && !isNotFoundError(error)) {
    throw error
  }

  return (data as Resume | null) ?? null
}

export async function createDefaultResume(user: Profile) {
  ensureConfigured()

  const { data, error } = await supabase
    .from('resumes')
    .insert({
      user_id: user.id,
      title: '我的简历',
      basic_info: {
        name: user.full_name,
        gender: '',
        age: 0,
        birthday: '',
        phone: user.phone || '',
        email: user.email,
        city: user.city || '',
        github: '',
        website: '',
      },
      education: [],
      experience: [],
      skills: [],
      projects: [],
      certificates: [],
      self_evaluation: user.bio || '',
      ai_suggestions: [],
      is_default: true,
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data as Resume
}

export async function saveResume(userId: string, updates: Partial<Resume> & { basic_info: Resume['basic_info'] }) {
  ensureConfigured()

  // 先检查是否已存在简历
  const { data: existingList, error: findError } = await supabase
    .from('resumes')
    .select('id')
    .eq('user_id', userId)
    .limit(1)

  if (findError) {
    throw findError
  }

  const existing = existingList && existingList.length > 0 ? existingList[0] : null

  if (existing) {
    // 更新现有简历
    const { data, error } = await supabase
      .from('resumes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select('*')

    if (error) {
      throw error
    }

    return data[0] as Resume
  } else {
    // 插入新简历
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
        title: '我的简历',
        education: [],
        experience: [],
        skills: [],
        projects: [],
        certificates: [],
        is_default: true,
      })
      .select('*')
      .single()

    if (error) {
      throw error
    }

    return data as Resume
  }
}

export async function uploadResumeFile(userId: string, file: File) {
  ensureConfigured()

  const filePath = `${userId}/${Date.now()}-${normalizeFileName(file.name)}`
  const { error } = await supabase.storage
    .from('resumes')
    .upload(filePath, file, {
      upsert: false,
    })

  if (error) {
    throw error
  }

  return filePath
}

export async function uploadAvatarFile(userId: string, file: File) {
  ensureConfigured()

  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'png'
  const filePath = `${userId}/avatar-${Date.now()}.${extension}`
  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      upsert: true,
    })

  if (error) {
    throw error
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function fetchApplications(userId: string, role: UserRole) {
  ensureConfigured()

  const column = role === 'recruiter' ? 'recruiter_id' : 'user_id'
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      job:jobs(
        *,
        company:companies(*),
        recruiter:profiles(*)
      ),
      resume:resumes(*),
      user:profiles!applications_user_id_fkey(*)
    `)
    .eq(column, userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as Application[]
}

export async function createApplication(params: {
  jobId: string
  userId: string
  recruiterId: string
  resumeId: string | null
}) {
  ensureConfigured()

  const { data, error } = await supabase
    .from('applications')
    .insert({
      job_id: params.jobId,
      user_id: params.userId,
      recruiter_id: params.recruiterId,
      resume_id: params.resumeId,
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data as Application
}

export async function fetchApplicationForJob(jobId: string, userId: string) {
  ensureConfigured()

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('job_id', jobId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error && !isNotFoundError(error)) {
    throw error
  }

  return (data as Application | null) ?? null
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  ensureConfigured()

  const { data, error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data as Application
}

export async function fetchConversations(userId: string) {
  ensureConfigured()

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      jobseeker:profiles!conversations_jobseeker_id_fkey(*),
      recruiter:profiles!conversations_recruiter_id_fkey(*),
      job:jobs(
        *,
        company:companies(*)
      )
    `)
    .or(`jobseeker_id.eq.${userId},recruiter_id.eq.${userId}`)
    .order('last_message_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as Conversation[]
}

export async function ensureConversation(params: {
  jobId: string | null
  jobseekerId: string
  recruiterId: string
}) {
  ensureConfigured()

  let query = supabase
    .from('conversations')
    .select(`
      *,
      jobseeker:profiles!conversations_jobseeker_id_fkey(*),
      recruiter:profiles!conversations_recruiter_id_fkey(*),
      job:jobs(
        *,
        company:companies(*)
      )
    `)
    .eq('jobseeker_id', params.jobseekerId)
    .eq('recruiter_id', params.recruiterId)

  if (params.jobId) {
    query = query.eq('job_id', params.jobId)
  } else {
    query = query.is('job_id', null)
  }

  const { data: existing, error: existingError } = await query.maybeSingle()

  if (existingError && !isNotFoundError(existingError)) {
    throw existingError
  }

  if (existing) {
    return existing as Conversation
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      jobseeker_id: params.jobseekerId,
      recruiter_id: params.recruiterId,
      job_id: params.jobId,
      last_message: '',
      last_message_at: new Date().toISOString(),
      jobseeker_unread: 0,
      recruiter_unread: 0,
    })
    .select(`
      *,
      jobseeker:profiles!conversations_jobseeker_id_fkey(*),
      recruiter:profiles!conversations_recruiter_id_fkey(*),
      job:jobs(
        *,
        company:companies(*)
      )
    `)
    .single()

  // 如果因为唯一约束冲突插入失败（并发场景），再次查询获取已存在的会话
  if (error && error.code === '23505') {
    const { data: conflictData, error: conflictError } = await query.maybeSingle()
    if (!conflictError && conflictData) {
      return conflictData as Conversation
    }
  }

  if (error) {
    throw error
  }

  return data as Conversation
}

export async function fetchMessages(conversationId: string) {
  ensureConfigured()

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as Message[]
}

export async function markConversationRead(conversationId: string, role: UserRole) {
  ensureConfigured()

  const field = role === 'recruiter' ? 'recruiter_unread' : 'jobseeker_unread'

  // Guard: only update if there are unread messages to avoid redundant writes
  const { data, error: checkError } = await supabase
    .from('conversations')
    .select('recruiter_unread, jobseeker_unread')
    .eq('id', conversationId)
    .single()

  if (checkError || !data) return

  // Use type casting to safely access the unread count
  const unreadCount = (data as Record<string, any>)[field]
  if (unreadCount === 0) return

  const { error } = await supabase
    .from('conversations')
    .update({ [field]: 0 })
    .eq('id', conversationId)

  if (error) {
    throw error
  }
}

export async function sendConversationMessage(params: {
  conversation: Conversation
  senderId: string
  senderRole: UserRole
  content: string
}) {
  ensureConfigured()

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: params.conversation.id,
      sender_id: params.senderId,
      content: params.content,
      message_type: 'text',
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  const updates: Record<string, string | number> = {
    last_message: params.content,
    last_message_at: new Date().toISOString(),
  }

  if (params.senderRole === 'recruiter') {
    updates.recruiter_unread = 0
    updates.jobseeker_unread = (params.conversation.jobseeker_unread || 0) + 1
  } else {
    updates.jobseeker_unread = 0
    updates.recruiter_unread = (params.conversation.recruiter_unread || 0) + 1
  }

  const { error: updateError } = await supabase
    .from('conversations')
    .update(updates)
    .eq('id', params.conversation.id)

  if (updateError) {
    throw updateError
  }

  return data as Message
}

export async function fetchInterviews(userId: string) {
  ensureConfigured()

  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as Interview[]
}

export async function createInterview(params: {
  userId: string
  jobId: string | null
  jobTitle: string
}) {
  ensureConfigured()

  const { data, error } = await supabase
    .from('interviews')
    .insert({
      user_id: params.userId,
      job_id: params.jobId,
      job_title: params.jobTitle,
      status: 'active',
      messages: [],
      ai_feedback: {},
      ai_score: 0,
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data as Interview
}

export async function updateInterview(
  id: string,
  updates: Partial<Pick<Interview, 'messages' | 'ai_feedback' | 'ai_score' | 'status'>>,
) {
  ensureConfigured()

  const { data, error } = await supabase
    .from('interviews')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data as Interview
}

export async function fetchProfileStats(userId: string, role: UserRole): Promise<ProfileStats> {
  ensureConfigured()

  const [
    applicationsResult,
    conversationsResult,
    jobsResult,
    interviewsResult,
    resumeResult,
  ] = await Promise.all([
    supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq(role === 'recruiter' ? 'recruiter_id' : 'user_id', userId),
    supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .or(`jobseeker_id.eq.${userId},recruiter_id.eq.${userId}`),
    supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('recruiter_id', userId),
    supabase
      .from('interviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('resumes')
      .select('ai_score')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const firstError = [
    applicationsResult.error,
    conversationsResult.error,
    jobsResult.error,
    interviewsResult.error,
    resumeResult.error,
  ].find(Boolean)

  if (firstError) {
    throw firstError
  }

  const counts = {
    applications: applicationsResult.count ?? 0,
    conversations: conversationsResult.count ?? 0,
    jobs: jobsResult.count ?? 0,
    interviews: interviewsResult.count ?? 0,
  }

  if (role === 'recruiter') {
    return {
      summaryCards: [
        { label: '收到简历', value: String(counts.applications) },
        { label: '在招职位', value: String(counts.jobs) },
        { label: '活跃对话', value: String(counts.conversations) },
        { label: '历史面试', value: String(counts.interviews) },
      ],
      quickEntryCounts: counts,
    }
  }

  return {
    summaryCards: [
      { label: '投递记录', value: String(counts.applications) },
      { label: '面试次数', value: String(counts.interviews) },
      { label: '活跃对话', value: String(counts.conversations) },
      { label: 'AI 评分', value: String((resumeResult.data as Pick<Resume, 'ai_score'> | null)?.ai_score ?? 0) },
    ],
    quickEntryCounts: counts,
  }
}

// 获取候选人简历列表（供 HR 搜索牛人）
export async function fetchCandidateResumes(page = 1, pageSize = 20, filters?: {
  city?: string
  minDegree?: string
  majors?: string[]
  skills?: string[]
  minAiScore?: number
  sortBy?: 'ai_score' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}) {
  ensureConfigured()

  let query = supabase
    .from('resumes')
    .select(`
      *,
      user:profiles!resumes_user_id_fkey(*)
    `, { count: 'exact' })

  // Apply sorting
  const sortField = filters?.sortBy || 'ai_score'
  const sortDirection = filters?.sortOrder || 'desc'
  query = query.order(sortField, { ascending: sortDirection === 'asc' })

  if (filters?.city) {
    query = query.filter('basic_info->>city', 'ilike', `%${filters.city}%`)
  }

  if (filters?.minAiScore) {
    query = query.gte('ai_score', filters.minAiScore)
  }

  // Get all matching results for the simple filters that work reliably
  // Degree, major, and skills filtering will happen client-side for better fuzzy matching
  // We fetch up to 1000 candidates which is enough for a recruitment platform
  const { data: allData, error, count } = await query.range(0, 999)

  if (error) {
    throw error
  }

  let candidates = (allData ?? []) as (Resume & { user: Profile })[]

  // Client-side filtering for minimum degree - this is simple and reliable
  const degreeOrder: Record<string, number> = {
    '大专': 1,
    '本科': 2,
    '硕士': 3,
    '博士': 4,
  }
  if (filters?.minDegree && degreeOrder[filters.minDegree]) {
    const minDegreeValue = degreeOrder[filters.minDegree]
    candidates = candidates.filter(resume => {
      if (!resume.education || resume.education.length === 0) return false
      // Check if any education entry meets or exceeds the minimum degree requirement
      return resume.education.some(edu => {
        const degreeValue = degreeOrder[edu.degree] ?? 0
        return degreeValue >= minDegreeValue
      })
    })
  }

  // Client-side filtering for major keywords (fuzzy search)
  if (filters?.majors && filters.majors.length > 0) {
    candidates = candidates.filter(resume => {
      if (!resume.education || resume.education.length === 0) return false
      // Check if any education major contains any of the search keywords (case-insensitive)
      return resume.education.some(edu =>
        filters.majors!.some(keyword =>
          edu.major.toLowerCase().includes(keyword.toLowerCase())
        )
      )
    })
  }

  // Client-side filtering for skills (fuzzy search)
  if (filters?.skills && filters.skills.length > 0) {
    candidates = candidates.filter(resume => {
      if (!resume.skills || resume.skills.length === 0) return false
      // Check if any skill contains any of the search keywords (case-insensitive)
      return resume.skills.some(skill =>
        filters.skills!.some(keyword =>
          skill.toLowerCase().includes(keyword.toLowerCase())
        )
      )
    })
  }

  // After filtering, do pagination manually
  const total = candidates.length
  const from = (page - 1) * pageSize
  const to = from + pageSize
  const paginatedCandidates = candidates.slice(from, to)

  return {
    resumes: paginatedCandidates,
    total: total,
    page,
    pageSize,
  }
}
