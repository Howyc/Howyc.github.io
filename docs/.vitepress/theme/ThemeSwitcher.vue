<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useData } from 'vitepress'

const { isDark } = useData()

const themes = [
  { id: 'midnight', label: '午夜', icon: '🌙', dark: true },
  { id: 'daylight', label: '日光', icon: '☀️', dark: false },
  { id: 'ocean', label: '深海', icon: '🌊', dark: true },
  { id: 'sakura', label: '樱花', icon: '🌸', dark: false },
  { id: 'forest', label: '森林', icon: '🌲', dark: true },
  { id: 'mint', label: '薄荷', icon: '🍃', dark: false },
  { id: 'nebula', label: '星云', icon: '🪐', dark: true },
  { id: 'lavender', label: '薰衣草', icon: '💜', dark: false },
  { id: 'ember', label: '余烬', icon: '🔥', dark: true },
  { id: 'sand', label: '沙漠', icon: '🏜️', dark: false },
] as const

const current = ref('midnight')
const open = ref(false)

const currentTheme = computed(() => themes.find(t => t.id === current.value))

function apply(id: string) {
  const theme = themes.find(t => t.id === id)
  if (!theme) return

  const doc = document.documentElement
  const oldId = current.value

  const doSwitch = () => {
    // Remove old, add new
    doc.classList.remove(`theme-${oldId}`)
    doc.classList.add(`theme-${id}`)

    // Sync VitePress dark mode
    if (theme.dark !== isDark.value) {
      document.querySelector<HTMLButtonElement>('.VPSwitchAppearance')?.click()
    }
  }

  // Animate with View Transitions
  if ('startViewTransition' in document) {
    ;(document as any).startViewTransition(doSwitch)
  } else {
    doSwitch()
  }

  current.value = id
  open.value = false
  localStorage.setItem('vp-theme-color', id)
}

function onClickOutside(e: MouseEvent) {
  const el = document.querySelector('.theme-switcher')
  if (el && !el.contains(e.target as Node)) open.value = false
}

onMounted(() => {
  const saved = localStorage.getItem('vp-theme-color') || 'midnight'
  current.value = saved
  document.documentElement.classList.add(`theme-${saved}`)

  const theme = themes.find(t => t.id === saved)
  if (theme && theme.dark !== isDark.value) {
    setTimeout(() => document.querySelector<HTMLButtonElement>('.VPSwitchAppearance')?.click(), 100)
  }

  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div class="theme-switcher">
    <button class="theme-trigger" @click.stop="open = !open" title="切换主题">
      <span class="trigger-icon">{{ currentTheme?.icon }}</span>
      <span class="trigger-label">{{ currentTheme?.label }}</span>
      <svg class="trigger-arrow" :class="{ open }" width="12" height="12" viewBox="0 0 12 12">
        <path d="M3 5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
    <Transition name="dropdown">
      <div v-show="open" class="theme-dropdown">
        <div class="dropdown-section">
          <div class="section-title">暗色</div>
          <button
            v-for="t in themes.filter(t => t.dark)" :key="t.id"
            :class="['theme-item', { active: current === t.id }]"
            @click="apply(t.id)"
          >
            <span class="item-icon">{{ t.icon }}</span>
            <span>{{ t.label }}</span>
          </button>
        </div>
        <div class="dropdown-divider" />
        <div class="dropdown-section">
          <div class="section-title">亮色</div>
          <button
            v-for="t in themes.filter(t => !t.dark)" :key="t.id"
            :class="['theme-item', { active: current === t.id }]"
            @click="apply(t.id)"
          >
            <span class="item-icon">{{ t.icon }}</span>
            <span>{{ t.label }}</span>
          </button>
        </div>
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
  color: var(--vp-c-text-1); font-size: 13px; transition: all 0.25s;
}
.theme-trigger:hover { border-color: var(--vp-c-brand-1); }
.trigger-icon { font-size: 15px; }
.trigger-label { display: none; }
.trigger-arrow { transition: transform 0.2s; }
.trigger-arrow.open { transform: rotate(180deg); }
@media (min-width: 768px) { .trigger-label { display: inline; } }

.theme-dropdown {
  position: absolute; top: calc(100% + 6px); right: 0;
  background: var(--vp-c-bg-elv); border: 1px solid var(--vp-c-divider);
  border-radius: 12px; padding: 8px; min-width: 150px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.15); z-index: 99;
}
.section-title {
  font-size: 11px; color: var(--vp-c-text-3); padding: 4px 8px;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.dropdown-divider {
  height: 1px; background: var(--vp-c-divider); margin: 4px 0;
}
.theme-item {
  display: flex; align-items: center; gap: 8px; width: 100%;
  background: none; border: none; cursor: pointer;
  padding: 7px 8px; border-radius: 8px; font-size: 13px;
  color: var(--vp-c-text-1); transition: all 0.2s;
}
.theme-item:hover { background: var(--vp-c-bg-soft); }
.theme-item.active { background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); }
.item-icon { font-size: 15px; }

.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0; transform: translateY(-6px) scale(0.96);
}
</style>
