<template>
  <div
    :class="['avatar', sizeClass, shapeClass, { 'avatar-has-image': Boolean(src) }]"
    :aria-label="alt"
    role="img"
  >
    <img v-if="src" :src="src" :alt="alt" class="avatar-image" />
    <span v-else class="avatar-icon" aria-hidden="true"></span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  src?: string
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square'
}>(), {
  src: '',
  alt: '默认头像',
  size: 'md',
  shape: 'circle',
})

const sizeClass = computed(() => {
  if (props.size === 'xs') return 'avatar-xs'
  if (props.size === 'sm') return 'avatar-sm'
  if (props.size === 'lg') return 'avatar-lg'
  if (props.size === 'xl') return 'avatar-xl'
  return ''
})

const shapeClass = computed(() => props.shape === 'square' ? 'avatar-square' : 'avatar-circle')
</script>

<style scoped>
.avatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-surface-300);
  border: 1px solid var(--color-border);
  overflow: hidden;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
}

.avatar-circle {
  border-radius: 50%;
}

.avatar-square {
  border-radius: var(--radius-sm);
}

.avatar-xs {
  width: 24px;
  height: 24px;
}

.avatar-sm {
  width: 32px;
  height: 32px;
}

.avatar-lg {
  width: 64px;
  height: 64px;
}

.avatar-xl {
  width: 96px;
  height: 96px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-icon {
  width: 60%;
  height: 60%;
  background-color: var(--color-text-tertiary);
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E");
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
}
</style>
