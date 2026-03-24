<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()

interface Article { title: string; link: string; date?: string; tags?: string[] }

const articles = computed<Article[]>(() => frontmatter.value.articles || [])
const currentTag = computed(() => frontmatter.value.currentTag || '')

const tagMap = computed(() => {
  const map: Record<string, Article[]> = {}
  for (const a of articles.value) {
    for (const t of a.tags || []) {
      ;(map[t] ||= []).push(a)
    }
  }
  return map
})

const displayTags = computed(() =>
  currentTag.value ? { [currentTag.value]: tagMap.value[currentTag.value] || [] } : tagMap.value
)
</script>

<template>
  <div class="tags-page">
    <div v-if="!currentTag" class="all-tags">
      <a v-for="(arts, tag) in tagMap" :key="tag" :href="`/blog/tags/${tag}`" class="tag-chip">
        {{ tag }} <span class="count">{{ arts.length }}</span>
      </a>
    </div>
    <div v-for="(arts, tag) in displayTags" :key="tag" class="tag-group">
      <h2>{{ tag }}</h2>
      <ul>
        <li v-for="a in arts" :key="a.link">
          <a :href="a.link">{{ a.title }}</a>
          <span v-if="a.date" class="date">{{ a.date }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.all-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.tag-chip {
  background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1);
  padding: 4px 14px; border-radius: 16px; text-decoration: none;
  font-size: 14px; transition: opacity 0.2s;
}
.tag-chip:hover { opacity: 0.8; }
.count { font-size: 12px; opacity: 0.7; margin-left: 4px; }
.tag-group ul { list-style: none; padding: 0; }
.tag-group li { padding: 6px 0; display: flex; justify-content: space-between; }
.tag-group a { color: var(--vp-c-text-1); text-decoration: none; }
.tag-group a:hover { color: var(--vp-c-brand-1); }
.date { color: var(--vp-c-text-3); font-size: 13px; }
</style>
