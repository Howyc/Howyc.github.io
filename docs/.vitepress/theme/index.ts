import DefaultTheme from 'vitepress/theme'
import ReadingProgress from './ReadingProgress.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
import './themes.css'
import type { Theme } from 'vitepress'
import { h } from 'vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-top': () => h(ReadingProgress),
      'nav-bar-content-after': () => h(ThemeSwitcher),
    })
  },
} satisfies Theme
