<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useData } from 'vitepress'

const { isDark } = useData()

const themes = [
  { id: 'default-light', label: '默认亮', icon: '☀️', dark: false },
  { id: 'default-dark', label: '默认暗', icon: '🌙', dark: true },
  { id: 'green-light', label: '绿野亮', icon: '🌿', dark: false },
  { id: 'green-dark', label: '绿野暗', icon: '🌲', dark: true },
  { id: 'purple-light', label: '星空亮', icon: '🔮', dark: false },
  { id: 'purple-dark', label: '星空暗', icon: '✨', dark: true },
  { id: 'warm-light', label: '暖阳亮', icon: '🌅', dark: false },
  { id: 'warm-dark', label: '暖阳暗', icon: '🌆', dark: true },
] as const

const current = ref('default-light')
const open = ref(false)

function apply(id: string) {
  const theme = themes.find(t => t.id === id)
  if (!theme) return

  const doc = document.documentElement

  // Remove all theme classes
  themes.forEach(t => doc.classList.remove(`theme-${t.id}`))

  // Apply new theme
  doc.classList.add(`theme-${id}`)

  // Toggle dark mode via VitePress
  if (theme.dark !== isDark.value) {
    document.querySelector<HTMLButtonElement>('.VPSwitchAppearance')?.click()
  }

  // View Transition animation
  if ('startViewTransition' in document) {
    ;(document as any).startViewTransition(() => {})
  }

  current.value = id
  open.value = false
  localStorage.setItem('vp-theme-color', id)
}

function handleClickOutside(e: MouseEvent) {
  const el = document.querySelector('.theme-switcher')
  if (el && !el.contains(e.target as Node)) open.value = false
}

onMounted(() => {
  const saved = localStorage.getItem('vp-theme-color') || (isDark.value ? 'default-dark' : 'default-light')
  current.value = saved
  document.documentElement.classList.add(`theme-${saved}`)

  // Sync dark mode
  const theme = themes.find(t => t.id === saved)
  if (theme && theme.dark !== isDark.value) {
    setTimeout(() => document.querySelector<HTMLButtonElement>('.VPSwitchAppearance')?.click(), 100)
  }

  document.addEventListener('click', handleClickOutside)
})

const currentTheme = ref<typeof themes[number]>()
watch(current, (id) => {
  currentTheme.value = themes.find(t => t.id === id)
}, { immediate: true })
</script>

<template>
  <div class="theme-switcher">
    <button class="theme-trigger" @click="open = !open" title="切换主题">
      <span class="trigger-icon">{{ currentTheme?.icon }}</span>
      <span class="trigger-label">{{ currentTheme?.label }}</span>
      <svg class="trigger-arrow" :class="{ open }" width="12" height="12" viewBox="0 0 12 12">
        <path d="M3 5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
    <Transition name="dropdown">
      <div v-show="open" class="theme-dropdown">
        <button
          v-for="t in themes" :key="t.id"
          :class="['theme-item', { active: current === t.id }]"
          @click="apply(t.id)"
        >
          <span class="item-icon">{{ t.icon }}</span>
          <span class="item-label">{{ t.label }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.theme-switcher { position: relative; margin-left: 8px; }
.theme-trigger {
  display: flex; align-items: center; gap: 4px;
  background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider);
  border-radius: 8px; padding: 4px 10px; cursor: pointer;
  color: var(--vp-c-text-1); font-size: 13px;
  transition: all 0.25s;
}
.theme-trigger:hover { border-color: var(--vp-c-brand-1); }
.trigger-icon { font-size: 16px; }
.trigger-label { display: none; }
.trigger-arrow { transition: transform 0.2s; }
.trigger-arrow.open { transform: rotate(180deg); }

@media (min-width: 768px) {
  .trigger-label { display: inline; }
}

.theme-dropdown {
  position: absolute; top: calc(100% + 6px); right: 0;
  background: var(--vp-c-bg-elv); border: 1px solid var(--vp-c-divider);
  border-radius: 10px; padding: 4px; min-width: 130px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 99;
  display: grid; grid-template-columns: 1fr 1fr; gap: 2px;
}
.theme-item {
  display: flex; align-items: center; gap: 6px;
  background: none; border: none; cursor: pointer;
  padding: 8px 10px; border-radius: 8px; font-size: 13px;
  color: var(--vp-c-text-1); transition: all 0.2s; white-space: nowrap;
}
.theme-item:hover { background: var(--vp-c-bg-soft); }
.theme-item.active { background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); }
.item-icon { font-size: 16px; }

.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0; transform: translateY(-4px);
}
</style>
