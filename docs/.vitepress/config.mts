import { defineConfig } from 'vitepress'

export default defineConfig({
  // GitHub Pages 部署：仓库名为 howyc.github.io 时 base 为 '/'
  // 如果仓库名是其他名字（如 my-site），改为 '/my-site/'
  base: '/',

  lang: 'zh-CN',
  title: 'Howyc.dev',
  description: '前端工程师的个人知识库 — React · Spring Boot · DevOps · 工程实践',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],

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
          text: '前端部署',
          items: [
            { text: '前端部署', link: '/devops/frontend-deploy/frontend-deployment' },
          ],
        },
        {
          text: '后端部署',
          items: [
            { text: '后端部署', link: '/devops/backend-deploy/backend-deployment' },
          ],
        },
        {
          text: '文档站部署',
          items: [
            { text: '文档站部署', link: '/devops/docs-deploy/docs-deployment' },
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
