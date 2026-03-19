import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const docsDir = resolve(__dirname, '..')
const configPath = resolve(__dirname, '../.vitepress/config.mts')

function readDoc(relativePath: string): string {
  return readFileSync(resolve(docsDir, relativePath), 'utf-8')
}

// ── 1. 知识库文件完整性 ──────────────────────────────────────

describe('知识库文件完整性', () => {
  const expectedFiles = [
    'backend/java/java-zero-to-one.md',
    'backend/spring-boot/java-for-frontend.md',
    'backend/spring-boot/backend-knowledge.md',
    'frontend/engineering/project-setup.md',
    'frontend/react/frontend-knowledge.md',
    'devops/frontend-deploy/frontend-deployment.md',
    'devops/backend-deploy/backend-deployment.md',
    'devops/docs-deploy/docs-deployment.md',
    'tools/openclaw/openclaw-guide.md',
    'tools/openclaw/openclaw-installation-journey.md',
    'tools/aigc-learning-path.md',
    'projects/fetch-mcp-demo.md',
    'blog/why-java.md',
  ]

  it.each(expectedFiles)('%s exists and is non-empty', (file) => {
    const filePath = resolve(docsDir, file)
    expect(existsSync(filePath)).toBe(true)
    const content = readFileSync(filePath, 'utf-8')
    expect(content.trim().length).toBeGreaterThan(0)
  })
})

// ── 2. VitePress 配置: nav 和 sidebar ────────────────────────

describe('VitePress 配置', () => {
  const config = readFileSync(configPath, 'utf-8')

  it('nav contains all expected entries', () => {
    const navItems = ['首页', '前端', '后端', 'DevOps', '工具', '项目', '博客']
    for (const item of navItems) {
      expect(config).toContain(`'${item}'`)
    }
  })

  it('sidebar contains /frontend/ config', () => {
    expect(config).toContain("'/frontend/'")
  })

  it('sidebar contains /backend/ config', () => {
    expect(config).toContain("'/backend/'")
  })

  it('sidebar contains /devops/ config', () => {
    expect(config).toContain("'/devops/'")
  })

  it('sidebar contains /tools/ config', () => {
    expect(config).toContain("'/tools/'")
  })

  it('sidebar contains /projects/ config', () => {
    expect(config).toContain("'/projects/'")
  })

  it('sidebar contains /blog/ config', () => {
    expect(config).toContain("'/blog/'")
  })

  it('sidebar has frontend articles in correct structure', () => {
    expect(config).toContain('/frontend/react/frontend-knowledge')
    expect(config).toContain('/frontend/engineering/project-setup')
  })

  it('sidebar has backend articles in correct structure', () => {
    expect(config).toContain('/backend/java/java-zero-to-one')
    expect(config).toContain('/backend/spring-boot/java-for-frontend')
    expect(config).toContain('/backend/spring-boot/backend-knowledge')
  })

  it('sidebar has devops articles in correct structure', () => {
    expect(config).toContain('/devops/frontend-deploy/frontend-deployment')
    expect(config).toContain('/devops/backend-deploy/backend-deployment')
    expect(config).toContain('/devops/docs-deploy/docs-deployment')
  })

  it('sidebar has tools articles in correct structure', () => {
    expect(config).toContain('/tools/openclaw/openclaw-guide')
    expect(config).toContain('/tools/openclaw/openclaw-installation-journey')
    expect(config).toContain('/tools/aigc-learning-path')
  })
})

// ── 3. project-setup.md 关键词覆盖 ─────────────────────────

describe('project-setup.md 关键词覆盖', () => {
  const content = readDoc('frontend/engineering/project-setup.md')
  const keywords = [
    'npm create vite',
    'vite.config.ts',
    'tsconfig',
    'main.tsx',
    'package.json',
    'arco-design',
  ]

  it.each(keywords)('contains keyword: %s', (kw) => {
    expect(content.toLowerCase()).toContain(kw.toLowerCase())
  })
})

describe('frontend-knowledge.md 关键词覆盖', () => {
  const content = readDoc('frontend/react/frontend-knowledge.md')
  const keywords = [
    'useState',
    'useEffect',
    'useContext',
    'interface',
    'BrowserRouter',
    'AuthContext',
    'authFetch',
    'import.meta.env',
  ]

  it.each(keywords)('contains keyword: %s', (kw) => {
    expect(content).toContain(kw)
  })
})

describe('frontend-deployment.md 关键词覆盖', () => {
  const content = readDoc('devops/frontend-deploy/frontend-deployment.md')
  const keywords = [
    'Vercel',
    'vercel.json',
    'VITE_API_BASE_URL',
    'GitHub Actions',
    'deploy-frontend.yml',
  ]

  it.each(keywords)('contains keyword: %s', (kw) => {
    expect(content).toContain(kw)
  })
})

describe('backend-knowledge.md 关键词覆盖', () => {
  const content = readDoc('backend/spring-boot/backend-knowledge.md')
  const keywords = [
    'Controller',
    'Service',
    'Repository',
    '@Entity',
    'JpaRepository',
    '@Autowired',
    '@RestController',
    'JwtUtil',
    'ApiResponse',
    'CorsConfig',
    'pom.xml',
    'application.properties',
  ]

  it.each(keywords)('contains keyword: %s', (kw) => {
    expect(content).toContain(kw)
  })
})

describe('backend-deployment.md 关键词覆盖', () => {
  const content = readDoc('devops/backend-deploy/backend-deployment.md')
  const keywords = [
    'TiDB Cloud',
    'Render',
    'Dockerfile',
    'application-prod.properties',
    'SPRING_PROFILES_ACTIVE',
  ]

  it.each(keywords)('contains keyword: %s', (kw) => {
    expect(content).toContain(kw)
  })
})

describe('docs-deployment.md 关键词覆盖', () => {
  const content = readDoc('devops/docs-deploy/docs-deployment.md')
  const keywords = [
    'GitHub Pages',
    'GitHub Actions',
    'deploy-docs.yml',
    'VitePress',
  ]

  it.each(keywords)('contains keyword: %s', (kw) => {
    expect(content).toContain(kw)
  })
})

// ── 4. 跨文档链接 ─────────────────────────────────────────────

describe('跨文档链接', () => {
  const files = [
    'frontend/engineering/project-setup.md',
    'frontend/react/frontend-knowledge.md',
    'devops/frontend-deploy/frontend-deployment.md',
    'backend/spring-boot/backend-knowledge.md',
    'devops/backend-deploy/backend-deployment.md',
    'devops/docs-deploy/docs-deployment.md',
  ]

  it('at least one doc links to /projects/fetch-mcp-demo', () => {
    const hasLink = files.some((f) =>
      readDoc(f).includes('/projects/fetch-mcp-demo')
    )
    expect(hasLink).toBe(true)
  })

  it('at least one doc links to java-zero-to-one', () => {
    const hasLink = files.some((f) =>
      readDoc(f).includes('java-zero-to-one')
    )
    expect(hasLink).toBe(true)
  })
})
