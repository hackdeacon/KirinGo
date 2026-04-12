<template>
  <router-link :to="`/jobs/${job.id}`" class="job-card card">
    <div class="job-card-body">
      <!-- 顶部: 职位名 + 薪资 -->
      <div class="job-card-top">
        <h3 class="job-title">{{ job.title }}</h3>
        <span class="job-salary">{{ job.salary_min }}-{{ job.salary_max }}K</span>
      </div>

      <!-- 标签 -->
      <div class="job-tags">
        <span class="tag-pill">{{ job.city }}</span>
        <span class="tag-pill">{{ job.experience }}</span>
        <span class="tag-pill">{{ job.education }}</span>
      </div>

      <!-- 技能标签 -->
      <div class="job-skills" v-if="job.tags?.length">
        <span v-for="tag in job.tags.slice(0, 4)" :key="tag" class="skill-tag">{{ tag }}</span>
      </div>

      <!-- 底部: 公司信息 -->
      <div class="job-card-footer">
        <div class="company-info">
          <div class="company-logo">
            {{ job.company?.name?.charAt(0) || 'C' }}
          </div>
          <div class="company-detail">
            <span class="company-name">{{ job.company?.name || '未知公司' }}</span>
            <span class="company-meta">{{ job.company?.industry }} · {{ job.company?.scale }}</span>
          </div>
        </div>
        <div class="recruiter-info" v-if="job.recruiter">
          <div class="recruiter-avatar">
            {{ job.recruiter.full_name?.charAt(0) }}
          </div>
          <span class="recruiter-name">{{ job.recruiter.full_name }}</span>
          <span class="recruiter-dot">·</span>
          <span class="recruiter-title">招聘者</span>
        </div>
      </div>
    </div>

    <!-- AI 匹配分数 -->
    <div v-if="matchScore" class="match-score" :class="matchScoreClass">
      <div class="match-label-wrapper">
        <ZapIcon class="match-icon" />
        <span class="match-label">AI 匹配</span>
      </div>
      <span class="match-value">{{ matchScore }}%</span>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Job } from '@/types'
import { Zap as ZapIcon } from 'lucide-vue-next'

const props = defineProps<{
  job: Job
  matchScore?: number
}>()

const matchScoreClass = computed(() => {
  if (!props.matchScore) return ''
  if (props.matchScore >= 80) return 'score-high'
  if (props.matchScore >= 60) return 'score-mid'
  return 'score-low'
})
</script>

<style scoped>
.job-card {
  display: block;
  text-decoration: none;
  padding: 24px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  background-color: var(--color-bg-surface-200); /* Slightly lighter than surface-400 */
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.job-card:hover {
  background-color: var(--color-bg-surface-100);
  box-shadow: var(--shadow-cursor-elevated);
  transform: translateY(-4px);
  border-color: var(--color-border-medium);
}

.job-card-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.job-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.job-title {
  font-family: var(--font-display);
  font-size: var(--font-size-title-sm);
  font-weight: 400;
  color: var(--color-text-primary);
  line-height: 1.2;
  letter-spacing: var(--tracking-title-sm);
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s ease;
}

.job-card:hover .job-title {
  color: var(--color-primary);
}

.job-salary {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 400;
  color: var(--color-primary);
  flex-shrink: 0;
}

.job-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-pill {
  padding: 2px 10px;
  font-family: var(--font-display);
  font-size: 12px;
  color: var(--color-text-secondary);
  background: var(--color-bg-surface-300);
  border-radius: var(--radius-pill);
}

.job-skills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.skill-tag {
  padding: 2px 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-tertiary);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  letter-spacing: var(--tracking-mono);
}

.job-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}

.company-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.company-logo {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--color-text-primary);
  color: var(--color-bg-canvas);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 16px;
  overflow: hidden;
}

.company-detail {
  display: flex;
  flex-direction: column;
}

.company-name {
  font-family: var(--font-display);
  font-size: 14px;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.company-meta {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin-top: 2px;
}

.recruiter-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-display);
  font-size: 11px;
  color: var(--color-text-tertiary);
}

.recruiter-avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-bg-surface-500);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  color: var(--color-text-secondary);
}

.match-score {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-surface-300);
  border: 1px solid var(--color-border);
  z-index: 2;
}

.match-label-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.match-icon {
  width: 10px;
  height: 10px;
  color: var(--color-primary);
}

.match-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.05em;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
}

.match-value {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 16px;
  color: var(--color-primary);
  line-height: 1;
}

.score-high .match-value { color: var(--color-success); }
.score-high .match-icon { color: var(--color-success); }
.score-mid .match-value { color: #c08532; }
.score-mid .match-icon { color: #c08532; }
.score-low .match-value { color: var(--color-error); }
.score-low .match-icon { color: var(--color-error); }

@media (max-width: 768px) {
  .job-card {
    padding: 20px;
  }
  
  .match-score {
    top: auto;
    bottom: 20px;
    right: 20px;
  }
}
</style>
