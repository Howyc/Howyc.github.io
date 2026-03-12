import { useState } from 'react'

/**
 * API 练习场组件
 * 帮助你直接在浏览器里测试后端接口，理解每个接口的作用和返回数据格式。
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const API_EXAMPLES = [
  {
    category: '健康检查',
    items: [
      { label: '服务状态', method: 'GET', path: '/api/health', body: null },
    ]
  },
  {
    category: '用户查询',
    items: [
      { label: '获取所有用户', method: 'GET', path: '/api/db/users', body: null },
      { label: '按 ID 查询用户', method: 'GET', path: '/api/db/users/detail?id=1', body: null },
      { label: '按城市查询', method: 'GET', path: '/api/db/users/by-city?city=Gwenborough', body: null },
      { label: '按邮箱搜索', method: 'GET', path: '/api/db/users/search?email=gmail', body: null },
      { label: '获取城市列表', method: 'GET', path: '/api/db/cities', body: null },
      { label: '用户统计', method: 'GET', path: '/api/db/count', body: null },
    ]
  },
  {
    category: '帖子查询',
    items: [
      { label: '获取所有帖子', method: 'GET', path: '/api/db/posts', body: null },
      { label: '按 ID 查询帖子', method: 'GET', path: '/api/db/posts/detail?id=1', body: null },
      { label: '按用户 ID 查询', method: 'GET', path: '/api/db/posts/by-user?userId=1', body: null },
      { label: '按标题搜索', method: 'GET', path: '/api/db/posts/search?title=sunt', body: null },
    ]
  },
  {
    category: '用户增删改',
    items: [
      {
        label: '新增用户', method: 'POST', path: '/api/db/users',
        body: JSON.stringify({ name: '张三', username: 'zhangsan', email: 'zhangsan@example.com', city: 'Beijing' }, null, 2)
      },
      {
        label: '更新用户', method: 'PUT', path: '/api/db/users/update?id=1',
        body: JSON.stringify({ name: '更新后的名字', email: 'updated@example.com' }, null, 2)
      },
      { label: '删除用户', method: 'DELETE', path: '/api/db/users/delete?id=99', body: null },
    ]
  },
  {
    category: '外部 API 代理',
    items: [
      { label: 'GitHub 用户信息', method: 'GET', path: '/api/github/users/octocat', body: null },
      { label: 'JSONPlaceholder 用户', method: 'GET', path: '/api/test/users', body: null },
    ]
  },
]

function getMethodClass(method: string) {
  switch (method) {
    case 'GET': return 'method-get'
    case 'POST': return 'method-post'
    case 'PUT': return 'method-put'
    case 'DELETE': return 'method-delete'
    default: return ''
  }
}

export function ApiPlayground() {
  const [url, setUrl] = useState(`${API_BASE}/api/health`)
  const [method, setMethod] = useState('GET')
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [status, setStatus] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [elapsed, setElapsed] = useState<number | null>(null)

  const sendRequest = async () => {
    setLoading(true)
    setResponse(null)
    const start = Date.now()
    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      }
      if (body && method !== 'GET') options.body = body
      const res = await fetch(url, options)
      setStatus(res.status)
      setElapsed(Date.now() - start)
      const text = await res.text()
      try {
        setResponse(JSON.stringify(JSON.parse(text), null, 2))
      } catch {
        setResponse(text)
      }
    } catch (err) {
      setStatus(0)
      setElapsed(Date.now() - start)
      setResponse(err instanceof Error ? `错误: ${err.message}` : '请求失败')
    } finally {
      setLoading(false)
    }
  }

  const loadExample = (item: { method: string; path: string; body: string | null }) => {
    setMethod(item.method)
    setUrl(`${API_BASE}${item.path}`)
    setBody(item.body || '')
    setResponse(null)
    setStatus(null)
  }

  const statusClass = status === null ? '' : status >= 200 && status < 300 ? 'status-ok' : 'status-err'

  return (
    <div className="api-playground">
      <div className="playground-header">
        <h2>API 练习场</h2>
        <p>点击左侧预设接口，或手动输入 URL，直接测试后端接口并查看返回数据。</p>
      </div>

      <div className="playground-inner">
        {/* 左侧：预设接口列表 */}
        <div className="playground-sidebar">
          {API_EXAMPLES.map(group => (
            <div key={group.category} className="endpoint-group">
              <div className="endpoint-category-label">{group.category}</div>
              {group.items.map(item => (
                <button
                  key={item.label}
                  onClick={() => loadExample(item)}
                  className={`endpoint-btn${url === `${API_BASE}${item.path}` ? ' active' : ''}`}
                >
                  <span className={getMethodClass(item.method)}>{item.method}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* 右侧：请求编辑器 + 响应 */}
        <div className="playground-editor">
          <div className="request-row">
            <select
              value={method}
              onChange={e => setMethod(e.target.value)}
              className="method-select"
            >
              {['GET', 'POST', 'PUT', 'DELETE'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendRequest()}
              className="url-input-field"
              placeholder="输入接口 URL..."
            />
            <button
              onClick={sendRequest}
              disabled={loading}
              className="send-btn"
            >
              {loading ? '请求中...' : '发送'}
            </button>
          </div>

          {method !== 'GET' && (
            <div className="request-body-section">
              <div className="request-body-label">请求体 (JSON)</div>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={5}
                className="request-body-input"
                placeholder='{"key": "value"}'
              />
            </div>
          )}

          {(response !== null || loading) && (
            <div className="response-panel">
              <div className="response-meta">
                <span className="response-label">响应</span>
                {status !== null && (
                  <span className={`response-status ${statusClass}`}>
                    {status === 0 ? '连接失败' : `HTTP ${status}`}
                  </span>
                )}
                {elapsed !== null && (
                  <span className="response-elapsed">{elapsed}ms</span>
                )}
              </div>
              <pre className="response-body">
                {loading ? '加载中...' : response}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
