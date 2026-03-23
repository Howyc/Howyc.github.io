<script setup lang="ts">
import { ref, onMounted } from 'vue'

const themes = [
  { id: 'default', label: '默认', icon: '🎨' },
  { id: 'green', label: '绿野', icon: '🌿' },
  { id: 'purple', label: '星空', icon: '🔮' },
  { id: 'warm', label: '暖阳', icon: '🌅' },
] as const

const current = ref('default')
const open = ref(false)

function apply(id: string) {
  const doc = document.documentElement
  const old = `theme-${current.value}`
  const next = `theme-${id}`

  // View Transitions API for smooth animation
  if ('startViewTransition' in document) {
    ;(document as any).startViewTransition(() => {
      doc.classList.replace(old, next) || (doc.classList.remove(old), doc.classList.add(next))
    })
  } else {
    doc.classList.remove(old)
    doc.classList.add(next)
  }

  current.value = id
  open.value = false
  localStorage.setItem('vp-theme-color', id)
}

onMounted(() => {
  const saved = localStorage.getItem('vp-theme-color') || 'default'
  current.value = saved
  document.documentElement.classList.add(`theme-${saved}`)
})
</script>

<template>
  <div class="theme-switcher">
    <button class="theme-btn" @click="open = !open" :title="'主题: ' + themes.find(t => t.id === current)?.label">
      {{ themes.find(t => t.id === current)?.icon }}
    </button>
    <div v-show="open" class="theme-menu">
      <button
        v-for="t in themes" :key="t.id"
        :class="['theme-option', { active: current === t.id }]"
        @click="apply(t.id)"
      >
        <span>{{ t.icon }}</span>
        <span>{{ t.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.theme-switcher { position: relative; }
.theme-btn {
  background: none; border: none; cursor: pointer;
  font-size: 18px; padding: 4px 8px; border-radius: 6px;
  transition: background 0.2s;
}
.theme-btn:hover { background: var(--vp-c-bg-soft); }
.theme-menu {
  position: absolute; top: 100%; right: 0; margin-top: 8px;
  background: var(--vp-c-bg-elv); border: 1px solid var(--vp-c-divider);
  border-radius: 8px; padding: 4px; min-width: 100px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 99;
}
.theme-option {
  display: flex; align-items: center; gap: 8px; width: 100%;
  background: none; border: none; cursor: pointer;
  padding: 6px 10px; border-radius: 6px; font-size: 14px;
  color: var(--vp-c-text-1); transition: background 0.2s;
}
.theme-option:hover { background: var(--vp-c-bg-soft); }
.theme-option.active { background: var(--vp-c-brand-soft); }
</style>
