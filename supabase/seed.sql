-- ============================================
-- KirinGo 模拟数据种子文件 (seed.sql)
-- ============================================

-- 注意：运行此脚本前，请确保 profiles 表中至少有一个 role 为 'recruiter' 的用户。
-- 你需要将下面的 'YOUR_RECRUITER_ID' 替换为实际的招聘者 UUID。

DO $$
DECLARE
    target_recruiter_id UUID;
BEGIN
    -- 尝试获取第一个招聘者的 ID
    SELECT id INTO target_recruiter_id FROM public.profiles WHERE role = 'recruiter' LIMIT 1;

    -- 如果没有招聘者，则打印警告并跳过（或者你可以手动指定一个）
    IF target_recruiter_id IS NULL THEN
        RAISE NOTICE '警告：未找到招聘者账号，请先注册一个招聘者账号后再运行此脚本。';
    ELSE
        RAISE NOTICE '正在使用招聘者 ID: % 导入数据...', target_recruiter_id;

        -- 1. 清理现有模拟数据 (可选)
        -- DELETE FROM public.jobs WHERE company_id IN (SELECT id FROM public.companies WHERE name LIKE '模拟-%');
        -- DELETE FROM public.companies WHERE name LIKE '模拟-%';

        -- 2. 插入公司数据
        INSERT INTO public.companies (id, recruiter_id, name, industry, scale, financing, city, address, description, website)
        VALUES 
        ('c1111111-1111-1111-1111-111111111111', target_recruiter_id, '麒麟科技 (KirinTech)', '互联网/AI', '500-999人', 'B轮', '北京', '海淀区中关村软件园', '领先的 AI 驱动招聘解决方案提供商，致力于用技术连接人才与机会。', 'https://kirintech.com'),
        ('c2222222-2222-2222-2222-222222222222', target_recruiter_id, '未来金融 (Future Finance)', '金融科技', '1000人以上', '已上市', '上海', '浦东新区陆家嘴金融中心', '致力于用区块链和大数据技术重塑传统金融服务，打造极致理财体验。', 'https://futurefin.com'),
        ('c3333333-3333-3333-3333-333333333333', target_recruiter_id, '极客云 (GeekCloud)', '云计算', '100-499人', 'A轮', '深圳', '南山区科技园', '提供高性能、易用的云原生基础设施，助力中小企业数字化转型。', 'https://geekcloud.io');

        -- 3. 插入职位数据
        INSERT INTO public.jobs (company_id, recruiter_id, title, description, requirements, city, district, salary_min, salary_max, experience, education, job_type, tags, status)
        VALUES
        -- 麒麟科技职位
        ('c1111111-1111-1111-1111-111111111111', target_recruiter_id, '高级前端开发工程师', '负责 KirinGo 核心产品的前端架构设计与开发，持续优化用户体验。', '1. 3年以上 Vue.js 经验；2. 精通 TypeScript 和 TailwindCSS；3. 有复杂中后台开发经验者优先。', '北京', '海淀区', 25, 45, '3-5年', '本科', '全职', '{Vue.js,TypeScript,TailwindCSS}', 'active'),
        ('c1111111-1111-1111-1111-111111111111', target_recruiter_id, 'AI 算法工程师', '研究和实现大语言模型在招聘场景下的应用，包括简历解析、职位推荐等。', '1. 精通 Python, PyTorch；2. 熟悉 Transformer 架构及 LLM 微调；3. 有 NLP 项目落地经验。', '北京', '海淀区', 35, 65, '1-3年', '硕士', '全职', '{NLP,LLM,Python}', 'active'),
        ('c1111111-1111-1111-1111-111111111111', target_recruiter_id, '产品经理 (AI 方向)', '定义 AI 招聘产品的功能特性，协调研发团队完成落地。', '1. 2年以上互联网产品经验；2. 对 AI 技术有浓厚兴趣和理解；3. 优秀的逻辑思维和沟通能力。', '北京', '海淀区', 20, 35, '1-3年', '本科', '全职', '{产品设计,AI,用户体验}', 'active'),

        -- 未来金融职位
        ('c2222222-2222-2222-2222-222222222222', target_recruiter_id, 'Java 后端开发 (资深)', '构建高性能、高可靠的金融交易系统，处理高并发请求。', '1. 精通 Java, Spring Boot, MyBatis；2. 熟悉分布式架构、消息队列及 Redis；3. 极强的抗压能力。', '上海', '浦东新区', 35, 55, '5-10年', '本科', '全职', '{Java,分布式,Redis}', 'active'),
        ('c2222222-2222-2222-2222-222222222222', target_recruiter_id, '数据分析师', '通过数据建模支持业务决策，优化金融产品策略。', '1. 熟练使用 SQL, Python/R；2. 掌握常用统计学模型；3. 具备金融行业背景者优先。', '上海', '浦东新区', 18, 30, '1-3年', '本科', '全职', '{数据分析,SQL,Tableau}', 'active'),
        ('c2222222-2222-2222-2222-222222222222', target_recruiter_id, 'UI/UX 设计师', '负责金融 App 的视觉设计和交互优化，提升品牌质感。', '1. 精通 Figma/Sketch；2. 优秀的审美能力和细节控；3. 熟悉 iOS/Android 设计规范。', '上海', '浦东新区', 15, 28, '3-5年', '本科', '全职', '{UI设计,Figma,交互设计}', 'active'),

        -- 极客云职位
        ('c3333333-3333-3333-3333-333333333333', target_recruiter_id, 'Go 云原生工程师', '负责云平台核心组件的开发和性能优化，维护 K8s 集群。', '1. 熟悉 Go 语言开发；2. 对 Kubernetes/Docker 有深入了解；3. 熟悉 Linux 网络编程。', '深圳', '南山区', 30, 50, '3-5年', '本科', '全职', '{Go,Kubernetes,Docker}', 'active'),
        ('c3333333-3333-3333-3333-333333333333', target_recruiter_id, '运维开发工程师 (SRE)', '自动化运维体系建设，保障平台高可用性。', '1. 熟悉 Python/Shell 脚本；2. 掌握 Ansible/Terraform；3. 熟悉监控预警系统。', '深圳', '南山区', 22, 40, '3-5年', '本科', '全职', '{Python,DevOps,SRE}', 'active'),
        ('c3333333-3333-3333-3333-333333333333', target_recruiter_id, '测试开发工程师', '设计和执行自动化测试用例，保证交付质量。', '1. 熟悉主流自动化测试框架；2. 具备编写测试脚本的能力；3. 细致严谨。', '深圳', '南山区', 18, 32, '1-3年', '本科', '全职', '{自动化测试,Selenium,Python}', 'active'),
        ('c3333333-3333-3333-3333-333333333333', target_recruiter_id, 'Node.js 后端工程师', '开发云平台的管理后台和 OpenAPI 服务。', '1. 精通 Node.js 及 Express/NestJS；2. 熟悉 MongoDB/PostgreSQL；3. 良好的代码风格。', '深圳', '南山区', 20, 38, '1-3年', '本科', '全职', '{Node.js,NestJS,Backend}', 'active');

        RAISE NOTICE '数据导入完成！共导入 3 家公司和 10 个职位。';
    END IF;
END $$;
