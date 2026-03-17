import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const tutorialsDir = resolve(__dirname, '..')
const configPath = resolve(__dirname, '../../.vitepress/config.mts')

function readTutorial(filename: string): string {
  return readFileSync(resolve(tutorialsDir, filename), 'utf-8')
}

// ── 1. Tutorial files exist and are non-empty ──────────────────────────

describe('教程文件完整性', () => {
  const expectedFiles = [
    'index.md',
    'project-setup.md',
    'frontend-knowledge.md',
    'frontend-deployment.md',
    'backend-knowledge.md',
    'backend-deployment.md',
    'docs-deployment.md',
  ]

  it.each(expectedFiles)('%s exists and is non-empty', (file) => {
    const filePath = resolve(tutorialsDir, file)
    expect(existsSync(filePath)).toBe(true)
    const content = readFileSync(filePath, 'utf-8')
    expect(content.trim().length).toBeGreaterThan(0)
  })
})

// ── 2. VitePress config: nav and sidebar ────────────────────────────────

describe('VitePress 配置', () => {
  const config = readFileSync(configPath, 'utf-8')

  it('nav contains 教程 entry', () => {
    expect(config).toContain("'教程'")
  })

  it('sidebar contains /tutorials/ config', () => {
    expect(config).toContain("'/tutorials/'")
  })

  it('sidebar has frontend module in correct order', () => {
    const setupIdx = config.indexOf('project-setup')
    const frontendKnowledgeIdx = config.indexOf('frontend-knowledge')
    const frontendDeployIdx = config.indexOf('frontend-deployment')

    expect(setupIdx).toBeGreaterThan(-1)
    expect(frontendKnowledgeIdx).toBeGreaterThan(setupIdx)
    expect(frontendDeployIdx).toBeGreaterThan(frontendKnowledgeIdx)
  })

  it('sidebar has backend module in correct order', () => {
    const backendKnowledgeIdx = config.indexOf('backend-knowledge')
    const backendDeployIdx = config.indexOf('backend-deployment')

    expect(backendKnowledgeIdx).toBeGreaterThan(-1)
    expect(backendDeployIdx).toBeGreaterThan(backendKnowledgeIdx)
  })

  it('sidebar has docs-deployment', () => {
    expect(config).toContain('docs-deployment')
  })
})


// ── 3. Tutorial index page content ──────────────────────────────────────

describe('教程首页内容', () => {
  const index = readTutorial('index.md')

  it('contains project background section', () => {
    expect(index).toContain('项目背景')
  })

  it('contains tech stack overview', () => {
    expect(index).toContain('技术栈')
  })

  it('contains chapter links for all modules', () => {
    expect(index).toContain('./project-setup')
    expect(index).toContain('./frontend-knowledge')
    expect(index).toContain('./frontend-deployment')
    expect(index).toContain('./backend-knowledge')
    expect(index).toContain('./backend-deployment')
    expect(index).toContain('./docs-deployment')
  })

  it('contains reading suggestions', () => {
    expect(index).toContain('阅读建议')
  })
})

// ── 4. Chapter keyword coverage ─────────────────────────────────────────

describe('project-setup.md 关键词覆盖', () => {
  const content = readTutorial('project-setup.md')
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
  const content = readTutorial('frontend-knowledge.md')
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
  const content = readTutorial('frontend-deployment.md')
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
  const content = readTutorial('backend-knowledge.md')
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
  const content = readTutorial('backend-deployment.md')
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
  const content = readTutorial('docs-deployment.md')
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

// ── 5. Cross-document links ─────────────────────────────────────────────

describe('跨文档链接', () => {
  const files = [
    'index.md',
    'project-setup.md',
    'frontend-knowledge.md',
    'frontend-deployment.md',
    'backend-knowledge.md',
    'backend-deployment.md',
    'docs-deployment.md',
  ]

  it('at least one tutorial links to /projects/fetch-mcp-demo', () => {
    const hasLink = files.some((f) =>
      readTutorial(f).includes('/projects/fetch-mcp-demo')
    )
    expect(hasLink).toBe(true)
  })

  it('at least one tutorial links to /notes/java-zero-to-one', () => {
    const hasLink = files.some((f) =>
      readTutorial(f).includes('/notes/java-zero-to-one')
    )
    expect(hasLink).toBe(true)
  })
})