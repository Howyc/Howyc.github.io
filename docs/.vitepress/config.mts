import { defineConfig } from 'vitepress'

export default defineConfig({
  // GitHub Pages 部署：仓库名为 howyc.github.io 时 base 为 '/'
  // 如果仓库名是其他名字（如 my-site），改为 '/my-site/'
  base: '/',

  lang: 'zh-CN',
  title: 'Howyc.dev',
  description: '全栈成长记录 — React · Spring Boot · 工程实践',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Howyc.dev',

    nav: [
      { text: '首页', link: '/' },
      { text: '博客', link: '/blog/' },
      { text: '项目', link: '/projects/' },
      { text: '笔记', link: '/notes/' },
      { text: '教程', link: '/tutorials/' },
    ],

    sidebar: {
      '/notes/': [
        {
          text: 'Java 学习笔记',
          items: [
            { text: 'Java 零基础入门', link: '/notes/java-zero-to-one' },
            { text: 'Java 前端视角', link: '/notes/java-for-frontend' },
          ],
        },
      ],
      '/projects/': [
        {
          text: '项目',
          items: [
            { text: '项目总览', link: '/projects/' },
            { text: 'fetch-mcp-demo 详解', link: '/projects/fetch-mcp-demo' },
          ],
        },
      ],
      '/blog/': [
        {
          text: '博客',
          items: [
            { text: '所有文章', link: '/blog/' },
          ],
        },
      ],
      '/tutorials/': [
        {
          text: '全栈教程',
          items: [
            { text: '教程首页', link: '/tutorials/' },
            { text: '前端项目创建', link: '/tutorials/project-setup' },
            { text: '前端知识点详解', link: '/tutorials/frontend-knowledge' },
            { text: '后端知识点详解', link: '/tutorials/backend-knowledge' },
            { text: '部署流程', link: '/tutorials/deployment' },
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

    // 搜索
    search: {
      provider: 'local',
    },

    // 编辑链接（指向 GitHub 仓库）
    editLink: {
      pattern: 'https://github.com/Howyc/howyc.github.io/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    lastUpdated: {
      text: '最后更新',
    },
  },

  markdown: {
    lineNumbers: true,
  },

  // 忽略死链检查（外部链接和跨项目引用）
  ignoreDeadLinks: true,
})
