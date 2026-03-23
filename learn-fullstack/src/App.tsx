import { useState, useEffect, lazy, Suspense } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// 路由级懒加载：LoginPage 和 ApiPlayground 按需加载，减小首屏 bundle
const LoginPage = lazy(() => import('./components/LoginPage').then(m => ({ default: m.LoginPage })))
const ApiPlayground = lazy(() => import('./components/ApiPlayground').then(m => ({ default: m.ApiPlayground })))

import { ErrorBoundary } from './components/ErrorBoundary'
import { ProtectedRoute } from './components/ProtectedRoute'
import { UserCardEditable } from './components/UserCardEditable'
import { PostCard } from './components/PostCard'
import { EditModal } from './components/EditModal'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { SkeletonCard } from './components/SkeletonCard'
import {
  fetchExternalUsers, saveUsersToBackend, fetchDatabaseUsers, createUser, updateUser, deleteUser,
  getUsersByCity, searchUsersByEmail, getAllCities,
  fetchExternalPosts, savePostsToBackend, fetchDatabasePosts, createPost, updatePost, deletePost,
  getPostsByUserId, searchPostsByTitle
} from './services/api'
import type { User, Post, SaveResult, DataSource } from './types'

function App() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  // 监听全局 auth:logout 事件（api.ts 收到 401 时触发）
  useEffect(() => {
    const handler = () => { logout(); navigate('/login') }
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [logout, navigate])

  const [activeSource, setActiveSource] = useState<DataSource | 'playground'>('users')

  // 用户数据
  const [users, setUsers] = useState<User[]>([])
  const [externalUsers, setExternalUsers] = useState<User[]>([])

  // 帖子数据
  const [posts, setPosts] = useState<Post[]>([])
  const [externalPosts, setExternalPosts] = useState<Post[]>([])

  // 状态
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null)

  // 搜索筛选
  const [searchText, setSearchText] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [cities, setCities] = useState<string[]>([])
  const [searchUserId, setSearchUserId] = useState('')

  // 编辑弹窗
  const [editModal, setEditModal] = useState<{
    show: boolean;
    type: 'user' | 'post';
    data: User | Post | null;
    isNew: boolean;
  }>({ show: false, type: 'user', data: null, isNew: false })

  // ========== 用户操作 ==========
  const handleFetchExternalUsers = async () => {
    setLoading(true)
    setError(null)
    setSaveResult(null)
    try {
      const data = await fetchExternalUsers()
      setExternalUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveUsers = async () => {
    if (externalUsers.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const result = await saveUsersToBackend(externalUsers)
      setSaveResult(result)
      await handleQueryUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setLoading(false)
    }
  }

  const handleQueryUsers = async () => {
    setLoading(true)
    setError(null)
    setSelectedCity('')
    setSearchText('')
    try {
      const data = await fetchDatabaseUsers()
      setUsers(data)
      // 获取城市列表
      const cityList = await getAllCities()
      setCities(cityList)
    } catch (err) {
      setError(err instanceof Error ? err.message : '查询失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchByCity = async (city: string) => {
    if (!city) {
      handleQueryUsers()
      return
    }
    setLoading(true)
    setError(null)
    setSelectedCity(city)
    try {
      const data = await getUsersByCity(city)
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '按城市查询失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchByEmail = async () => {
    if (!searchText.trim()) {
      handleQueryUsers()
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await searchUsersByEmail(searchText)
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜索失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm('确定删除此用户？')) return
    setLoading(true)
    try {
      await deleteUser(id)
      setUsers(users.filter(u => u.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    } finally {
      setLoading(false)
    }
  }

  // ========== 帖子操作 ==========
  const handleFetchExternalPosts = async () => {
    setLoading(true)
    setError(null)
    setSaveResult(null)
    try {
      const data = await fetchExternalPosts()
      setExternalPosts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePosts = async () => {
    if (externalPosts.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const result = await savePostsToBackend(externalPosts)
      setSaveResult(result)
      await handleQueryPosts()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setLoading(false)
    }
  }

  const handleQueryPosts = async () => {
    setLoading(true)
    setError(null)
    setSearchText('')
    setSearchUserId('')
    try {
      const data = await fetchDatabasePosts()
      setPosts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '查询失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchByTitle = async () => {
    if (!searchText.trim()) {
      handleQueryPosts()
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await searchPostsByTitle(searchText)
      setPosts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜索失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchByUserId = async () => {
    if (!searchUserId.trim()) {
      handleQueryPosts()
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getPostsByUserId(parseInt(searchUserId))
      setPosts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '按用户查询失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (id: number) => {
    if (!confirm('确定删除此帖子？')) return
    setLoading(true)
    try {
      await deletePost(id)
      setPosts(posts.filter(p => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    } finally {
      setLoading(false)
    }
  }

  // ========== 编辑保存 ==========
  const handleSaveEdit = async (data: User | Post) => {
    setLoading(true)
    try {
      if (editModal.type === 'user') {
        if (editModal.isNew) {
          const newUser = await createUser(data as Omit<User, 'id'>)
          setUsers([...users, newUser])
        } else {
          const updated = await updateUser((data as User).id, data as User)
          setUsers(users.map(u => u.id === updated.id ? updated : u))
        }
      } else {
        if (editModal.isNew) {
          const newPost = await createPost(data as Omit<Post, 'id'>)
          setPosts([...posts, newPost])
        } else {
          const updated = await updatePost((data as Post).id, data as Post)
          setPosts(posts.map(p => p.id === updated.id ? updated : p))
        }
      }
      setEditModal({ ...editModal, show: false })
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setLoading(false)
    }
  }

  const isLoading = loading
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const PAGE_TITLES: Record<typeof activeSource, string> = {
    users: '用户管理',
    posts: '帖子管理',
    playground: 'API 练习场',
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeSource={activeSource}
        onNavigate={setActiveSource}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="content-area">
        <TopBar
          title={PAGE_TITLES[activeSource]}
          loading={isLoading}
          error={error}
          onMenuToggle={() => setSidebarOpen(o => !o)}
        />

        <main className="page-content">
          {error && <div className="error-message">{error}</div>}

          {/* API 练习场 */}
          {activeSource === 'playground' && (
            <Suspense fallback={<div className="empty-state">加载中...</div>}>
              <ApiPlayground />
            </Suspense>
          )}

          {/* 操作面板 */}
          {activeSource !== 'playground' && (
            <div className="action-panel">
              <div className="panel-header">
                <span className="panel-icon">
                  {activeSource === 'users'
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  }
                </span>
                <span className="panel-title">{activeSource === 'users' ? '用户' : '帖子'}操作</span>
              </div>
              <div className="panel-body">
                <div className="button-row">
                  <button className="action-btn fetch-btn" onClick={activeSource === 'users' ? handleFetchExternalUsers : handleFetchExternalPosts} disabled={isLoading}>
                    获取外部数据
                  </button>
                  <button className="action-btn save-btn" onClick={activeSource === 'users' ? handleSaveUsers : handleSavePosts} disabled={isLoading || (activeSource === 'users' ? externalUsers.length === 0 : externalPosts.length === 0)}>
                    保存到数据库
                  </button>
                  <button className="action-btn query-btn" onClick={activeSource === 'users' ? handleQueryUsers : handleQueryPosts} disabled={isLoading}>
                    查询全部
                  </button>
                  <button className="action-btn add-btn" onClick={() => setEditModal({ show: true, type: activeSource === 'users' ? 'user' : 'post', data: null, isNew: true })}>
                    新增
                  </button>
                </div>

                <div className="search-section">
                  {activeSource === 'users' ? (
                    <>
                      <div className="search-row">
                        <input
                          type="text"
                          placeholder="按邮箱搜索..."
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearchByEmail()}
                          className="search-input"
                        />
                        <button className="search-btn" onClick={handleSearchByEmail} disabled={isLoading}>
                          搜索邮箱
                        </button>
                      </div>
                      <div className="search-row">
                        <select
                          value={selectedCity}
                          onChange={(e) => handleSearchByCity(e.target.value)}
                          className="filter-select"
                          disabled={isLoading}
                        >
                          <option value="">-- 按城市筛选 --</option>
                          {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="search-row">
                        <input
                          type="text"
                          placeholder="按标题搜索..."
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearchByTitle()}
                          className="search-input"
                        />
                        <button className="search-btn" onClick={handleSearchByTitle} disabled={isLoading}>
                          搜索标题
                        </button>
                      </div>
                      <div className="search-row">
                        <input
                          type="number"
                          placeholder="按用户ID筛选..."
                          value={searchUserId}
                          onChange={(e) => setSearchUserId(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearchByUserId()}
                          className="search-input"
                        />
                        <button className="search-btn" onClick={handleSearchByUserId} disabled={isLoading}>
                          按用户筛选
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {saveResult && (
                  <div className={`save-result ${saveResult.success ? 'success' : 'error'}`}>
                    {saveResult.message}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 数据展示 */}
          {activeSource !== 'playground' && (
            <div className="data-display">
              {/* 外部数据预览 */}
              <div className="data-panel-card">
                <div className="panel-header">
                  <span className="panel-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </span>
                  <span className="panel-title">外部获取的数据</span>
                  <span className="panel-count">{activeSource === 'users' ? externalUsers.length : externalPosts.length} 条</span>
                </div>
                <div className="panel-body">
                  {activeSource === 'users' ? (
                    externalUsers.length === 0 ? (
                      <div className="empty-state">点击「获取外部数据」获取用户</div>
                    ) : (
                      <div className="preview-list">
                        {externalUsers.map(user => (
                          <div key={user.id} className="preview-item">
                            <span className="preview-id">#{user.id}</span>
                            <span className="preview-text">{user.name} (@{user.username})</span>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    externalPosts.length === 0 ? (
                      <div className="empty-state">点击「获取外部数据」获取帖子</div>
                    ) : (
                      <div className="preview-list">
                        {externalPosts.map(post => (
                          <div key={post.id} className="preview-item">
                            <span className="preview-id">#{post.id}</span>
                            <span className="preview-text">{post.title}</span>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* 数据库数据 */}
              <div className="data-panel-card">
                <div className="panel-header">
                  <span className="panel-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                  </span>
                  <span className="panel-title">数据库中的数据</span>
                  <span className="panel-count">{activeSource === 'users' ? users.length : posts.length} 条</span>
                </div>
                <div className="panel-body">
                  {activeSource === 'users' ? (
                    isLoading && users.length === 0 ? (
                      <div className="card-grid">
                        {Array(3).fill(null).map((_, i) => <SkeletonCard key={i} />)}
                      </div>
                    ) : users.length === 0 ? (
                      <div className="empty-state">点击「查询全部」查看数据</div>
                    ) : (
                      <div className="card-grid">
                        {users.map(user => (
                          <UserCardEditable
                            key={user.id}
                            user={user}
                            onEdit={(u) => setEditModal({ show: true, type: 'user', data: u, isNew: false })}
                            onDelete={handleDeleteUser}
                          />
                        ))}
                      </div>
                    )
                  ) : (
                    isLoading && posts.length === 0 ? (
                      <div className="card-grid">
                        {Array(3).fill(null).map((_, i) => <SkeletonCard key={i} />)}
                      </div>
                    ) : posts.length === 0 ? (
                      <div className="empty-state">点击「查询全部」查看数据</div>
                    ) : (
                      <div className="card-grid">
                        {posts.map(post => (
                          <PostCard
                            key={post.id}
                            post={post}
                            onEdit={(p) => setEditModal({ show: true, type: 'post', data: p, isNew: false })}
                            onDelete={handleDeletePost}
                          />
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {editModal.show && (
        <EditModal
          type={editModal.type}
          data={editModal.data}
          isNew={editModal.isNew}
          onSave={handleSaveEdit}
          onClose={() => setEditModal({ ...editModal, show: false })}
        />
      )}
    </div>
  )
}

function AppWithAuth() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
        <Routes>
          <Route path="/login" element={
            <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f1117' }}>
              <div style={{ color: '#64748b', fontSize: 14 }}>加载中...</div>
            </div>}>
              <LoginPage />
            </Suspense>
          } />
          <Route path="/*" element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          } />
        </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default AppWithAuth
