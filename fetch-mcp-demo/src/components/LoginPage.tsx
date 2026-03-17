import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '@arco-design/web-react/dist/css/arco.css'
import { Form, Input, Button, Alert } from '@arco-design/web-react'
import { IconUser, IconLock } from '@arco-design/web-react/icon'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080')

type Mode = 'login' | 'register'

function validate(username: string, password: string, mode: Mode): string | null {
  if (!username.trim()) return '请输入用户名'
  if (username.trim().length < 3) return '用户名至少 3 个字符'
  if (username.trim().length > 20) return '用户名最多 20 个字符'
  if (!password) return '请输入密码'
  if (mode === 'register' && password.length < 6) return '密码至少 6 个字符'
  return null
}

export function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [form] = Form.useForm()
  const { login } = useAuth()
  const navigate = useNavigate()

  const doLogin = async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
    })
    const body = await res.json()
    if (!res.ok) throw new Error(body.message || '登录失败')
    return body.data.token as string
  }

  const handleSubmit = async () => {
    const username = (form.getFieldValue('username') as string) ?? ''
    const password = (form.getFieldValue('password') as string) ?? ''

    const validationError = validate(username, password, mode)
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError(null)
    setSuccessMsg(null)
    try {
      if (mode === 'login') {
        const token = await doLogin(username, password)
        login(token)
        navigate('/')
      } else {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), password }),
        })
        const body = await res.json()
        if (!res.ok) throw new Error(body.message || '注册失败')
        setSuccessMsg('注册成功，正在登录...')
        const token = await doLogin(username, password)
        login(token)
        navigate('/')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (m: Mode) => {
    setMode(m)
    setError(null)
    setSuccessMsg(null)
    form.resetFields()
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#0f1117',
    }}>
      <div style={{
        background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 14,
        padding: '2rem 2rem 1.75rem', width: 380,
        display: 'flex', flexDirection: 'column', gap: '1.25rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, margin: '0 auto 0.75rem',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2 style={{ color: '#e2e8f0', margin: 0, fontSize: 20, fontWeight: 600 }}>
            {mode === 'login' ? '欢迎回来' : '创建账号'}
          </h2>
          <p style={{ color: '#64748b', fontSize: 13, margin: '0.3rem 0 0' }}>
            {mode === 'login' ? '登录以继续使用' : '注册后即可使用全部功能'}
          </p>
        </div>

        {/* Tab 切换 */}
        <div style={{
          display: 'flex', background: '#0f1117', borderRadius: 8,
          padding: 3, border: '1px solid #2a2d3a',
        }}>
          {(['login', 'register'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                flex: 1, padding: '0.45rem', borderRadius: 6, border: 'none',
                background: mode === m ? '#4f46e5' : 'transparent',
                color: mode === m ? '#fff' : '#64748b',
                cursor: 'pointer', fontSize: 13, fontWeight: mode === m ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              {m === 'login' ? '登录' : '注册'}
            </button>
          ))}
        </div>

        {/* 表单 */}
        <Form form={form} layout="vertical" style={{ marginBottom: 0 }}>
          <Form.Item
            field="username"
            label={<span style={{ color: '#94a3b8', fontSize: 13 }}>用户名</span>}
            rules={[{ required: true, message: '请输入用户名' }, { minLength: 3, message: '用户名至少 3 个字符' }]}
          >
            <Input
              prefix={<IconUser />}
              placeholder="请输入用户名"
              disabled={loading}
              autoComplete="username"
              onPressEnter={handleSubmit}
            />
          </Form.Item>
          <Form.Item
            field="password"
            label={<span style={{ color: '#94a3b8', fontSize: 13 }}>密码</span>}
            style={{ marginBottom: 0 }}
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<IconLock />}
              placeholder={mode === 'register' ? '至少 6 个字符' : '请输入密码'}
              disabled={loading}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              onPressEnter={handleSubmit}
            />
          </Form.Item>
        </Form>

        {/* 错误 / 成功提示 */}
        {error && <Alert type="error" content={error} closable onClose={() => setError(null)} />}
        {successMsg && <Alert type="success" content={successMsg} />}

        {/* 提交按钮 */}
        <Button
          type="primary"
          long
          loading={loading}
          onClick={handleSubmit}
          style={{ background: '#4f46e5', borderColor: '#4f46e5', height: 38 }}
        >
          {mode === 'login' ? '登录' : '注册'}
        </Button>
      </div>
    </div>
  )
}
