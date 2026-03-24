import DefaultTheme from 'vitepress/theme'
import ReadingProgress from './ReadingProgress.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
import ArticleMeta from './ArticleMeta.vue'
import GiscusComment from './GiscusComment.vue'
import TagsPage from './TagsPage.vue'
import './themes.css'
import type { Theme } from 'vitepress'
import { h } from 'vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-top': () => h(ReadingProgress),
      'nav-bar-content-before': () => h(ThemeSwitcher),
      'doc-after': () => h(GiscusComment),
      'doc-before': () => h(ArticleMeta),
    })
  },
  enhanceApp({ app }) {
    app.component('TagsPage', TagsPage)
  },
} satisfies Theme
