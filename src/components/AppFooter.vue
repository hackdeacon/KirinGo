<template>
  <footer class="app-footer animate-fade-in">
    <div class="container-cursor">
      <!-- 链接导航区 -->
      <div class="footer-nav-grid">
        <div class="footer-brand-col">
          <div class="footer-logo text-display mb-6">KirinGo 麒麟智聘</div>
          <p class="footer-brand-desc text-serif mb-8">
            NEXT-GEN AI RECRUITMENT PLATFORM.<br>
            致力于用 AI 重新定义招聘与求职的每一个瞬间。
          </p>
          <div class="social-links">
            <a href="https://github.com/hackdeacon/KirinGo" target="_blank" rel="noopener noreferrer" class="social-icon-btn"><GithubIcon class="icon-sm" /></a>
            <a href="https://twitter.com/hackdeacon" target="_blank" rel="noopener noreferrer" class="social-icon-btn"><TwitterIcon class="icon-sm" /></a>
            <a href="https://hackdeacon.cn" target="_blank" rel="noopener noreferrer" class="social-icon-btn"><LinkedinIcon class="icon-sm" /></a>
          </div>
        </div>

        <div class="footer-links-col">
          <h4 class="footer-col-title text-mono">PLATFORM</h4>
          <nav class="footer-links">
            <router-link to="/jobs">{{ isRecruiter ? '寻找人才' : '职位搜索' }}</router-link>
            <template v-if="isJobseeker">
              <router-link to="/resume">简历诊断</router-link>
              <router-link to="/interview">AI 面试</router-link>
            </template>
            <template v-if="isRecruiter">
              <router-link to="/applications">人才管理</router-link>
              <router-link to="/jobs">职位发布</router-link>
            </template>
            <router-link to="/chat">{{ isRecruiter ? '即时沟通' : '即时消息' }}</router-link>
          </nav>
        </div>

        <div class="footer-links-col">
          <h4 class="footer-col-title text-mono">RESOURCES</h4>
          <nav class="footer-links">
            <router-link to="/docs/guide">使用指南</router-link>
            <router-link to="/docs/recruitment">招聘中心</router-link>
            <router-link to="/docs/ai-models">AI 模型说明</router-link>
            <router-link to="/docs/changelog">更新日志</router-link>
          </nav>
        </div>

        <div class="footer-links-col">
          <h4 class="footer-col-title text-mono">COMPANY</h4>
          <nav class="footer-links">
            <router-link to="/about">关于我们</router-link>
            <router-link to="/careers">加入我们</router-link>
            <router-link to="/privacy">隐私协议</router-link>
            <router-link to="/terms">服务条款</router-link>
          </nav>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="footer-copyright text-mono">&copy; 2026 KIRINGO INTELLIGENT TECHNOLOGY. ALL RIGHTS RESERVED.</div>
        <div class="footer-status-tag text-mono">
          <div class="status-pulse-dot"></div>
          SYSTEMS OPERATIONAL
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  Github as GithubIcon,
  Twitter as TwitterIcon,
  Linkedin as LinkedinIcon
} from 'lucide-vue-next'

const authStore = useAuthStore()
const isJobseeker = computed(() => authStore.isJobseeker)
const isRecruiter = computed(() => authStore.isRecruiter)
</script>

<style scoped>
.app-footer {
  padding: 80px 0 64px;
  background-color: #26251e;
  color: #ffffff;
  border-top: 1px solid oklab(1 0 0 / 0.08);
}

@media (max-width: 768px) {
  .app-footer {
    padding: 64px 0 100px;
  }
}

.footer-nav-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 64px;
  padding-bottom: 64px;
  border-bottom: 1px solid oklab(1 0 0 / 0.05);
}

.footer-brand-col {
  max-width: none;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.footer-brand-desc {
  font-size: 15px;
  line-height: 1.6;
  color: oklab(1 0 0 / 0.4);
  margin-bottom: 40px;
}

.social-links {
  display: flex;
  gap: 10px;
}

.social-icon-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid oklab(1 0 0 / 0.12);
  border-radius: 12px;
  color: oklab(1 0 0 / 0.5);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.social-icon-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #ffffff;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px oklab(0 0 0 / 0.25);
}

.social-icon-btn .icon-sm {
  width: 18px;
  height: 18px;
}

.footer-col-title {
  font-size: 11px;
  letter-spacing: 0.15em;
  color: oklab(1 0 0 / 0.3);
  margin-bottom: 24px;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-links :deep(a) {
  font-family: var(--font-display);
  font-size: 14px;
  color: oklab(1 0 0 / 0.55);
  text-decoration: none;
  transition: all 0.15s;
}

.footer-links :deep(a:hover) {
  color: #ffffff;
}

.footer-bottom {
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-logo {
  font-size: 24px;
  letter-spacing: -0.5px;
  color: #ffffff;
}

.footer-copyright {
  font-size: 10px;
  letter-spacing: 0.08em;
  color: oklab(1 0 0 / 0.25);
}

.footer-status-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 9px;
  letter-spacing: 0.12em;
  color: oklab(1 0 0 / 0.4);
  background: oklab(1 0 0 / 0.04);
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  border: 1px solid oklab(1 0 0 / 0.08);
}

.status-pulse-dot {
  width: 5px;
  height: 5px;
  background-color: var(--color-success);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--color-success);
  animation: pulse-mini 2s infinite;
}

@keyframes pulse-mini {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}

@media (max-width: 834px) {
  .footer-nav-grid { grid-template-columns: 1fr 1fr 1fr 1fr; gap: 32px; }
  .footer-brand-col { grid-column: span 4; }
}

@media (max-width: 640px) {
  .footer-nav-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .footer-brand-col { grid-column: span 3; }
  .footer-brand-col { text-align: center; }
  .social-links { justify-content: center; }
  .footer-links-col { text-align: center; }
  .footer-bottom { flex-direction: column; gap: 16px; align-items: center; text-align: center; }
}

@media (max-width: 480px) {
  .footer-nav-grid { grid-template-columns: repeat(3, 1fr); gap: 32px; }
  .footer-brand-col { grid-column: span 3; }
  .footer-brand-col { text-align: center; }
  .social-links { justify-content: center; }
  .footer-links-col { text-align: center; }
  .footer-bottom { flex-direction: column; gap: 16px; align-items: center; text-align: center; }
}
</style>
