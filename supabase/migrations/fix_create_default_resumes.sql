-- ============================================
-- 修复：为所有已经存在的求职者创建默认简历
-- ============================================

-- 为所有还没有简历的求职者创建默认简历
INSERT INTO public.resumes (
  user_id,
  title,
  basic_info,
  education,
  experience,
  skills,
  projects,
  certificates,
  is_default,
  created_at,
  updated_at
)
SELECT
  p.id,
  COALESCE(p.full_name, '我的简历'),
  jsonb_build_object(
    'name', p.full_name,
    'city', p.city,
    'phone', p.phone,
    'email', p.email,
    'gender', '',
    'age', 0
  ),
  '[]'::jsonb,
  '[]'::jsonb,
  '{}',
  '[]'::jsonb,
  '{}',
  true,
  NOW(),
  NOW()
FROM public.profiles p
WHERE p.role = 'jobseeker'
AND NOT EXISTS (
  SELECT 1 FROM public.resumes r
  WHERE r.user_id = p.id AND r.is_default = true
);

-- ============================================
-- 添加数据库触发器：新用户注册为求职者后自动创建默认简历
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_jobseeker_create_resume()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create default resume if user is a jobseeker
  IF NEW.role = 'jobseeker' THEN
    INSERT INTO public.resumes (
      user_id,
      title,
      basic_info,
      education,
      experience,
      skills,
      projects,
      certificates,
      is_default,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      COALESCE(NEW.full_name, '我的简历'),
      jsonb_build_object(
        'name', NEW.full_name,
        'city', NEW.city,
        'phone', NEW.phone,
        'email', NEW.email,
        'gender', '',
        'age', 0
      ),
      '[]'::jsonb,
      '[]'::jsonb,
      '{}',
      '[]'::jsonb,
      '{}',
      true,
      NOW(),
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 触发器：profile 创建后执行
DROP TRIGGER IF EXISTS create_default_resume_after_profile_insert ON public.profiles;
CREATE TRIGGER create_default_resume_after_profile_insert
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_jobseeker_create_resume();
