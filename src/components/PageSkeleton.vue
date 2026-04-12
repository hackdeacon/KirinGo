<template>
  <div :class="['page-skeleton', { 'auth-skeleton': authPage }]">
    <div class="skeleton-card"></div>
    <div class="skeleton-row"></div>
    <div class="skeleton-row short"></div>
    <div class="skeleton-grid">
      <div v-for="item in 6" :key="item" class="skeleton-tile"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  authPage?: boolean
}>()
</script>

<style scoped>
.page-skeleton {
  width: min(1100px, 100%);
  margin: 0 auto;
  padding: 20px;
}

.auth-skeleton {
  max-width: 520px;
  padding-top: 72px;
}

.skeleton-card,
.skeleton-row,
.skeleton-tile {
  position: relative;
  overflow: hidden;
  background: #eef1f5;
}

.skeleton-card {
  height: 150px;
  border-radius: 18px;
  margin-bottom: 18px;
}

.skeleton-row {
  height: 16px;
  border-radius: 10px;
  margin-bottom: 12px;
}

.skeleton-row.short {
  width: 55%;
  margin-bottom: 18px;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.skeleton-tile {
  height: 120px;
  border-radius: 14px;
}

.skeleton-card::after,
.skeleton-row::after,
.skeleton-tile::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    rgba(238, 241, 245, 0) 0%,
    rgba(255, 255, 255, 0.75) 50%,
    rgba(238, 241, 245, 0) 100%
  );
  animation: skeleton-loading 1.2s ease-in-out infinite;
}

@keyframes skeleton-loading {
  100% {
    transform: translateX(100%);
  }
}

@media (max-width: 768px) {
  .page-skeleton {
    padding: 14px;
  }

  .auth-skeleton {
    padding-top: 36px;
  }

  .skeleton-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .skeleton-tile {
    height: 96px;
  }
}
</style>
