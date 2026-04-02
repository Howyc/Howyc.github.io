<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useData, useRoute } from 'vitepress'

const { isDark, frontmatter } = useData()
const route = useRoute()
const container = ref<HTMLElement>()

function loadGiscus() {
  if (!container.value) return
  // Don't show on index pages, home layout, or pages with comment: false
  if (frontmatter.value.layout === 'home' || frontmatter.value.comment === false) return
  // Skip index pages (paths ending with / or /index)
  const path = route.path
  if (path.endsWith('/') || path.endsWith('/index') || path.endsWith('/index.html')) return

  container.value.innerHTML = ''
  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.setAttribute('data-repo', 'Howyc/howyc.github.io')
  script.setAttribute('data-repo-id', 'R_kgDORiDE5A')
  script.setAttribute('data-category', 'General')
  script.setAttribute('data-category-id', 'DIC_kwDORiDE5M4C5Ewz')
  script.setAttribute('data-mapping', 'pathname')
  script.setAttribute('data-strict', '0')
  script.setAttribute('data-reactions-enabled', '1')
  script.setAttribute('data-emit-metadata', '0')
  script.setAttribute('data-input-position', 'top')
  script.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  script.setAttribute('data-lang', 'zh-CN')
  script.setAttribute('crossorigin', 'anonymous')
  script.async = true
  container.value.appendChild(script)
}

// Reload on route change
watch(() => route.path, () => nextTick(loadGiscus))

// Update theme
watch(isDark, (dark) => {
  const iframe = container.value?.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
  iframe?.contentWindow?.postMessage(
    { giscus: { setConfig: { theme: dark ? 'dark' : 'light' } } },
    'https://giscus.app'
  )
})

onMounted(loadGiscus)
</script>

<template>
  <div ref="container" class="giscus-wrapper" />
</template>

<style scoped>
.giscus-wrapper {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
}
</style>
