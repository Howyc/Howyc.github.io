import { defineConfig } from 'vitepress'
import { withPwa } from '@vite-pwa/vitepress'

export default withPwa(defineConfig({
  base: '/',
  lang: 'zh-CN',
  title: 'Howyc.dev',
  description: '前端工程师的个人知识库 — React · Spring Boot · DevOps · 工程实践',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    // SEO: Open Graph
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Howyc.dev' }],
    ['meta', { property: 'og:description', content: '前端工程师的个人知识库 — React · Spring Boot · DevOps · 工程实践' }],
    ['meta', { property: 'og:url', content: 'https://howyc.github.io/' }],
    ['meta', { property: 'og:site_name', content: 'Howyc.dev' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    // SEO: Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: 'Howyc.dev' }],
    ['meta', { name: 'twitter:description', content: '前端工程师的个人知识库' }],
    // SEO: misc
    ['meta', { name: 'author', content: 'Howyc' }],
    ['meta', { name: 'robots', content: 'index, follow' }],
    // PWA
    ['meta', { name: 'theme-color', content: '#0b0f19' }],
    ['link', { rel: 'apple-touch-icon', href: '/logo.svg' }],
  ],

  appearance: 'dark',

  // Sitemap for SEO
  sitemap: {
    hostname: 'https://howyc.github.io',
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Howyc.dev',

    nav: [
      { text: '首页', link: '/' },
      { text: '前端', link: '/frontend/' },
      { text: '后端', link: '/backend/' },
      { text: 'DevOps', link: '/devops/' },
      { text: '工具', link: '/tools/' },
      { text: '项目', link: '/projects/' },
      { text: '博客', link: '/blog/' },
    ],

    sidebar: {
      '/frontend/': [
        {
          text: 'TypeScript',
          items: [
            { text: 'TypeScript 项目实战要点', link: '/frontend/typescript/typescript-essentials' },
          ],
        },
        {
          text: 'React 开发',
          items: [
            { text: '前端知识点详解', link: '/frontend/react/frontend-knowledge' },
          ],
        },
        {
          text: 'VitePress 文档站',
          items: [
            { text: 'VitePress 主题开发指南', link: '/frontend/vitepress/vitepress-theme-guide' },
          ],
        },
        {
          text: '工程化实践',
          items: [
            { text: '前端项目创建', link: '/frontend/engineering/project-setup' },
          ],
        },
      ],
      '/backend/': [
        {
          text: 'Java 语言',
          items: [
            { text: 'Java 零基础入门', link: '/backend/java/java-zero-to-one' },
          ],
        },
        {
          text: 'Spring Boot 框架',
          items: [
            { text: 'Java 前端视角', link: '/backend/spring-boot/java-for-frontend' },
            { text: '后端知识点详解', link: '/backend/spring-boot/backend-knowledge' },
          ],
        },
      ],
      '/devops/': [
        {
          text: '容器化',
          items: [
            { text: 'Docker Compose 本地开发', link: '/devops/container/docker-compose-dev' },
          ],
        },
        {
          text: 'CI/CD',
          items: [
            { text: 'CI/CD 持续集成与部署', link: '/devops/cicd/cicd-pipeline' },
          ],
        },
        {
          text: '部署实践',
          items: [
            { text: '前端部署', link: '/devops/frontend-deploy/frontend-deployment' },
            { text: '后端部署', link: '/devops/backend-deploy/backend-deployment' },
            { text: '文档站部署', link: '/devops/docs-deploy/docs-deployment' },
          ],
        },
        {
          text: '监控与日志',
          items: [
            { text: '监控与日志概念', link: '/devops/monitoring/monitoring-logging' },
          ],
        },
      ],
      '/tools/': [
        {
          text: 'OpenClaw',
          items: [
            { text: 'OpenClaw 完全指南', link: '/tools/openclaw/openclaw-guide' },
            { text: 'OpenClaw 安装历程', link: '/tools/openclaw/openclaw-installation-journey' },
          ],
        },
        {
          text: 'AIGC',
          items: [
            { text: 'AIGC 学习路线图', link: '/tools/aigc-learning-path' },
          ],
        },
      ],
      '/projects/': [
        {
          text: '项目实战',
          items: [
            { text: '项目总览', link: '/projects/' },
            { text: 'learn-fullstack 详解', link: '/projects/learn-fullstack' },
          ],
        },
      ],
      '/blog/': [
        {
          text: '思考与总结',
          items: [
            { text: '所有文章', link: '/blog/' },
            { text: '标签分类', link: '/blog/tags' },
            { text: '系列文章', link: '/blog/series' },
            { text: '为什么学 Java', link: '/blog/why-java' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Howyc' },
    ],

    footer: {
      message: 'Built with VitePress',
      copyright: 'Copyright © 2025 Howyc',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/Howyc/howyc.github.io/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    lastUpdated: {
      text: '最后更新',
    },

    outline: {
      level: [2, 3],
      label: '目录',
    },

    returnToTopLabel: '回到顶部',

    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },

    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '菜单',
  },

  markdown: {
    lineNumbers: true,
  },

  ignoreDeadLinks: true,

  // PWA configuration
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Howyc.dev 知识库',
      short_name: 'Howyc.dev',
      description: '前端工程师的个人知识库',
      theme_color: '#0b0f19',
      background_color: '#0b0f19',
      display: 'standalone',
      start_url: '/',
      icons: [
        {
          src: '/logo.svg',
          sizes: '192x192',
          type: 'image/svg+xml',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{css,js,html,svg,png,ico,txt,woff2}'],
    },
  },
}))
