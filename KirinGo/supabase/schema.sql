-- ============================================
-- KirinGo AI 智能招聘平台 - Supabase 数据库表结构
-- ============================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================
-- 1. 用户资料表 (profiles)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('jobseeker', 'recruiter')) DEFAULT 'jobseeker',
  phone TEXT DEFAULT '',
  city TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 用户资料 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可查看所有资料" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "用户可更新自己的资料" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "用户可插入自己的资料" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. 企业信息表 (companies)
-- ============================================
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT DEFAULT '',
  industry TEXT NOT NULL DEFAULT '',
  scale TEXT DEFAULT '',          -- 如: '20-99人', '100-499人'
  financing TEXT DEFAULT '',      -- 如: '天使轮', 'A轮', '已上市'
  city TEXT DEFAULT '',
  address TEXT DEFAULT '',
  description TEXT DEFAULT '',
  website TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "所有人可查看企业" ON public.companies
  FOR SELECT USING (true);

CREATE POLICY "招聘者可管理自己的企业" ON public.companies
  FOR ALL USING (auth.uid() = recruiter_id);

-- ============================================
-- 3. 职位表 (jobs)
-- ============================================
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  district TEXT DEFAULT '',
  salary_min INTEGER NOT NULL DEFAULT 0,    -- 单位: K (千)
  salary_max INTEGER NOT NULL DEFAULT 0,
  experience TEXT DEFAULT '',               -- 如: '1-3年', '3-5年'
  education TEXT DEFAULT '',                -- 如: '本科', '硕士'
  job_type TEXT DEFAULT '全职',             -- 全职/兼职/实习
  tags TEXT[] DEFAULT '{}',                 -- 技能标签
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
  view_count INTEGER DEFAULT 0,
  embedding VECTOR(1536),                   -- AI 职位向量
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "所有人可查看已发布职位" ON public.jobs
  FOR SELECT USING (status = 'active' OR auth.uid() = recruiter_id);

CREATE POLICY "招聘者可管理自己的职位" ON public.jobs
  FOR ALL USING (auth.uid() = recruiter_id);

-- 职位搜索索引
CREATE INDEX idx_jobs_city ON public.jobs(city);
CREATE INDEX idx_jobs_salary ON public.jobs(salary_min, salary_max);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC);

-- ============================================
-- 4. 简历表 (resumes)
-- ============================================
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '我的简历',
  file_url TEXT DEFAULT '',
  -- 结构化简历数据
  basic_info JSONB DEFAULT '{}',            -- {name, gender, age, phone, email, city}
  education JSONB DEFAULT '[]',             -- [{school, degree, major, start, end}]
  experience JSONB DEFAULT '[]',            -- [{company, position, start, end, description}]
  skills TEXT[] DEFAULT '{}',
  projects JSONB DEFAULT '[]',              -- [{name, role, description, start, end}]
  certificates TEXT[] DEFAULT '{}',
  self_evaluation TEXT DEFAULT '',
  -- AI 相关
  ai_optimized_content TEXT DEFAULT '',     -- AI 优化后的内容
  ai_score INTEGER DEFAULT 0,              -- AI 评分 (0-100)
  ai_suggestions JSONB DEFAULT '[]',       -- AI 改进建议
  embedding VECTOR(1536),                  -- 简历向量
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可管理自己的简历" ON public.resumes
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 5. 职位申请/投递表 (applications)
-- ============================================
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id),
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',      -- 待查看
    'viewed',       -- 已查看
    'interview',    -- 面试邀请
    'offer',        -- 已发offer
    'rejected',     -- 不合适
    'withdrawn'     -- 已撤回
  )),
  ai_match_score INTEGER DEFAULT 0,         -- AI 匹配分数 0-100
  ai_match_detail JSONB DEFAULT '{}',       -- AI 匹配详情
  cover_letter TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 由于 resumes 表的某个策略引用了 applications 表，我们在这里定义该策略
CREATE POLICY "招聘者可查看投递过来的简历" ON public.resumes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.resume_id = resumes.id
      AND a.recruiter_id = auth.uid()
    )
  );

CREATE POLICY "求职者可查看自己的投递" ON public.applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "招聘者可查看收到的投递" ON public.applications
  FOR SELECT USING (auth.uid() = recruiter_id);

CREATE POLICY "求职者可创建投递" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "求职者可更新自己的投递" ON public.applications
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = recruiter_id);

-- ============================================
-- 6. 聊天会话表 (conversations)
-- ============================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jobseeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  last_message TEXT DEFAULT '',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  jobseeker_unread INTEGER DEFAULT 0,
  recruiter_unread INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(jobseeker_id, recruiter_id, job_id)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "参与者可查看会话" ON public.conversations
  FOR SELECT USING (auth.uid() = jobseeker_id OR auth.uid() = recruiter_id);

CREATE POLICY "参与者可创建会话" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = jobseeker_id OR auth.uid() = recruiter_id);

CREATE POLICY "参与者可更新会话" ON public.conversations
  FOR UPDATE USING (auth.uid() = jobseeker_id OR auth.uid() = recruiter_id);

-- ============================================
-- 7. 聊天消息表 (messages)
-- ============================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "会话参与者可查看消息" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (c.jobseeker_id = auth.uid() OR c.recruiter_id = auth.uid())
    )
  );

CREATE POLICY "会话参与者可发送消息" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 消息索引
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);

-- ============================================
-- 8. AI 模拟面试表 (interviews)
-- ============================================
CREATE TABLE public.interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  job_title TEXT NOT NULL DEFAULT '',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  messages JSONB DEFAULT '[]',             -- [{role: 'ai'|'user', content: '...'}]
  ai_feedback JSONB DEFAULT '{}',          -- AI 面试整体反馈
  ai_score INTEGER DEFAULT 0,             -- AI 面试评分
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可管理自己的面试" ON public.interviews
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 9. 自动更新 updated_at 触发器
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_interviews_updated_at
  BEFORE UPDATE ON public.interviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 10. 新用户自动创建 profile 的函数
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'jobseeker')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 11. 向量匹配函数 (用于 AI 职位匹配)
-- ============================================
CREATE OR REPLACE FUNCTION match_jobs(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 10,
  match_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id,
    j.title,
    1 - (j.embedding <=> query_embedding) AS similarity
  FROM public.jobs j
  WHERE j.status = 'active'
    AND j.embedding IS NOT NULL
    AND 1 - (j.embedding <=> query_embedding) > match_threshold
  ORDER BY j.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================
-- 12. 实时推送配置
-- ============================================
-- 启用消息表的实时推送
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- ============================================
-- 13. Storage bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage RLS
CREATE POLICY "用户可上传自己的简历" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "用户可查看自己的简历" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "任何人可上传头像" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "任何人可查看头像" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
