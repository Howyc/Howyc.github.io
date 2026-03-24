<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()

const tags = computed(() => frontmatter.value.tags || [])
const series = computed(() => frontmatter.value.series || '')
const seriesOrder = computed(() => frontmatter.value.seriesOrder || 0)
const date = computed(() => frontmatter.value.date || '')

const readingTime = ref('')

onMounted(() => {
  const content = document.querySelector('.vp-doc')?.textContent || ''
  const minutes = Math.max(1, Math.ceil(content.length / 300))
  readingTime.value = `约 ${minutes} 分钟`
})
</script>

<template>
  <div v-if="tags.length || series || date" class="article-meta">
    <span v-if="date" class="meta-date">📅 {{ date }}</span>
    <span v-if="readingTime" class="meta-reading">⏱ {{ readingTime }}</span>
    <span v-if="series" class="meta-series">
      📚 系列：<a href="/blog/series">{{ series }}</a>
      <span v-if="seriesOrder"> #{{ seriesOrder }}</span>
    </span>
    <div v-if="tags.length" class="meta-tags">
      <a v-for="tag in tags" :key="tag" href="/blog/tags" class="tag">
        {{ tag }}
      </a>
    </div>
  </div>
</template>

<style scoped>
.article-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin: -8px 0 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 14px;
  color: var(--vp-c-text-2);
}
.meta-series a, .tag {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}
.meta-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.tag {
  background: var(--vp-c-brand-soft);
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  transition: opacity 0.2s;
}
.tag:hover { opacity: 0.8; }
</style>
