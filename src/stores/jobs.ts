// ============================================
// 职位状态管理
// ============================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchJobById as loadJobById, fetchJobs as loadJobs } from '@/lib/database'
import type { Job } from '@/types'

export const useJobStore = defineStore('jobs', () => {
  const jobs = ref<Job[]>([])
  const currentJob = ref<Job | null>(null)
  const loading = ref(false)
  const error = ref<string>('')
  const filters = ref({
    keyword: '',
    city: '全部',
    experience: '不限',
    education: '不限',
    salaryMin: 0,
    salaryMax: 999,
  })

  const filteredJobs = computed(() => {
    return jobs.value.filter(job => {
      // 关键词搜索
      if (filters.value.keyword) {
        const kw = filters.value.keyword.toLowerCase()
        const match = job.title.toLowerCase().includes(kw) ||
          job.company?.name?.toLowerCase().includes(kw) ||
          job.tags.some(t => t.toLowerCase().includes(kw))
        if (!match) return false
      }

      // 城市筛选
      if (filters.value.city !== '全部' && job.city !== filters.value.city) {
        return false
      }

      // 经验筛选
      if (filters.value.experience !== '不限' && job.experience !== filters.value.experience) {
        return false
      }

      // 学历筛选
      if (filters.value.education !== '不限' && job.education !== filters.value.education) {
        return false
      }

      // 薪资筛选
      if (filters.value.salaryMin > 0 || filters.value.salaryMax < 999) {
        if (job.salary_max < filters.value.salaryMin || job.salary_min > filters.value.salaryMax) {
          return false
        }
      }

      return true
    })
  })

  async function fetchJobs() {
    loading.value = true
    try {
      error.value = ''
      jobs.value = await loadJobs()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '职位加载失败'
      jobs.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchJobById(id: string) {
    try {
      error.value = ''
      currentJob.value = await loadJobById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '职位详情加载失败'
      currentJob.value = null
    }

    return currentJob.value
  }

  function setFilters(newFilters: Partial<typeof filters.value>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function resetFilters() {
    filters.value = {
      keyword: '',
      city: '全部',
      experience: '不限',
      education: '不限',
      salaryMin: 0,
      salaryMax: 999,
    }
  }

  return {
    jobs,
    currentJob,
    loading,
    error,
    filters,
    filteredJobs,
    fetchJobs,
    fetchJobById,
    setFilters,
    resetFilters,
  }
})
