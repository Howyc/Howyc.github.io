import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { resolve, dirname, extname } from 'node:path'
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
    'projects/learn-fullstack.md',
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

  it('at least one doc links to /projects/learn-fullstack', () => {
    const hasLink = files.some((f) =>
      readDoc(f).includes('/projects/learn-fullstack')
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


// ── 5. 内部链接校验 ─────────────────────────────────────────────

/** 内部链接信息 */
export interface InternalLink {
  text: string
  href: string
}

/**
 * 从 Markdown 内容中提取内部链接，忽略外部链接（http:// 或 https://）和纯锚点链接（#section）。
 * 带锚点的链接会去除 #section 部分。
 */
export function extractInternalLinks(content: string): InternalLink[] {
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g
  const links: InternalLink[] = []
  let match: RegExpExecArray | null

  while ((match = linkRegex.exec(content)) !== null) {
    const text = match[1]
    let href = match[2]

    // 忽略外部链接
    if (/^https?:\/\//.test(href)) continue

    // 忽略纯锚点链接
    if (href.startsWith('#')) continue

    // 去除锚点部分
    href = href.split('#')[0]

    links.push({ text, href })
  }

  return links
}

/** 递归收集目录下所有 .md 文件（相对于 baseDir 的路径） */
function collectMarkdownFiles(dir: string, baseDir: string): string[] {
  const results: string[] = []
  for (const entry of readdirSync(dir)) {
    const fullPath = resolve(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      // 跳过 node_modules 和 .vitepress
      if (entry === 'node_modules' || entry === '.vitepress') continue
      results.push(...collectMarkdownFiles(fullPath, baseDir))
    } else if (extname(entry) === '.md') {
      // 存储相对于 baseDir 的路径
      results.push(fullPath.slice(baseDir.length + 1))
    }
  }
  return results
}

/**
 * 解析内部链接的 href 为文件系统路径，返回是否存在。
 * - 绝对路径（以 / 开头）相对于 docsDir 解析
 * - 相对路径相对于当前文件所在目录解析
 * - 如果路径没有扩展名，依次尝试 path.md 和 path/index.md
 */
function resolveInternalLink(href: string, sourceFileRelative: string): boolean {
  const sourceDir = dirname(resolve(docsDir, sourceFileRelative))
  const base = href.startsWith('/') ? docsDir : sourceDir
  const targetBase = resolve(base, href.startsWith('/') ? href.slice(1) : href)

  // 如果路径已有扩展名，直接检查
  if (extname(targetBase) !== '') {
    return existsSync(targetBase)
  }

  // 无扩展名：尝试 path.md 和 path/index.md
  return existsSync(targetBase + '.md') || existsSync(resolve(targetBase, 'index.md'))
}

describe('内部链接校验', () => {
  const mdFiles = collectMarkdownFiles(docsDir, docsDir)

  // 收集所有内部链接及其来源文件
  const allLinks: { file: string; text: string; href: string }[] = []

  for (const file of mdFiles) {
    let content: string
    try {
      content = readFileSync(resolve(docsDir, file), 'utf-8')
    } catch {
      // 跳过无法读取的文件（如编码问题）
      continue
    }

    const links = extractInternalLinks(content)
    for (const link of links) {
      allLinks.push({ file, text: link.text, href: link.href })
    }
  }

  it.each(allLinks)(
    '$file: [$text]($href) 目标文件应存在',
    ({ href, file }) => {
      expect(resolveInternalLink(href, file)).toBe(true)
    }
  )
})
