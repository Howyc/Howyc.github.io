---
outline: deep
---

# 第 2 章：前端知识点详解

> 深入讲解本项目中使用的前端核心技术：React Hooks、TypeScript 类型系统、React Router 路由守卫、AuthContext 认证上下文、API 请求封装和环境变量配置。

本章将结合项目真实源码，逐一讲解前端开发中的核心知识点。每个知识点都配有来自 `learn-fullstack/src/` 的真实代码示例和逐行中文注释，帮助你理解这些技术在实际项目中是如何运作的。

如果你还没有了解项目的整体架构，建议先阅读 [learn-fullstack 项目详解](/projects/learn-fullstack)。上一章 [前端项目创建](../engineering/project-setup) 讲解了项目的初始化流程，本章在此基础上深入技术细节。

## React Hooks

[React Hooks](https://react.dev/reference/react/hooks) 是 React 16.8 引入的特性，让你在函数组件中使用状态和副作用等能力。本项目主要使用了三个核心 Hook：`useState`、`useEffect` 和 `useContext`。

### useState — 管理组件状态

`useState` 是最基础的 Hook，用于在函数组件中声明和管理状态变量。每次状态更新，组件会自动重新渲染。

::: info 什么是 useState？
`useState` 接收一个初始值，返回一个数组：第一个元素是当前状态值，第二个元素是更新状态的函数。调用更新函数后，React 会重新渲染组件，界面自动更新。
:::

下面是项目中 `App.tsx` 使用 `useState` 管理多个状态的真实代码：

来自 `learn-fullstack/src/App.tsx`

```tsx
// 从 react 包中导入 useState Hook
import { useState } from 'react'
// 从项目类型定义文件中导入所需的类型
import type { User, Post, DataSource } from './types'

// App 函数组件内部的状态声明
function App() {
  // 声明 activeSource 状态，类型为 DataSource | 'playground'，初始值为 'users'
  // DataSource 是联合类型 'users' | 'posts'，这里扩展了一个 'playground' 选项
  // setActiveSource 是更新函数，调用后组件会重新渲染
  const [activeSource, setActiveSource] = useState<DataSource | 'playground'>('users')
  // 声明 users 状态，类型为 User 数组，初始值为空数组
  // 用于存储从 API 获取的用户列表数据
  const [users, setUsers] = useState<User[]>([])
  // 声明 posts 状态，类型为 Post 数组，初始值为空数组
  // 用于存储从 API 获取的文章列表数据
  const [posts, setPosts] = useState<Post[]>([])
  // 声明 loading 状态，类型为 boolean，初始值为 false
  // 用于控制加载中的 UI 显示（如 loading spinner）
  const [loading, setLoading] = useState(false)
  // 声明 error 状态，类型为 string | null，初始值为 null
  // 用于存储错误信息，null 表示没有错误
  const [error, setError] = useState<string | null>(null)
  // ...
}
```

**要点总结：**

| 用法 | 说明 |
|------|------|
| `useState<Type>(初始值)` | 泛型参数指定状态的类型，TypeScript 会自动检查类型是否匹配 |
| `useState([])` | 初始值为空数组时，TypeScript 需要泛型参数来推断数组元素类型 |
| `useState(false)` | 简单类型（boolean、number）TypeScript 可以自动推断，无需泛型 |
| `useState<string \| null>(null)` | 联合类型需要显式声明，否则 TypeScript 会推断为 `null` 类型 |

### useEffect — 处理副作用

`useEffect` 用于在组件渲染后执行副作用操作，比如发起网络请求、订阅事件、操作 DOM 等。它接收两个参数：副作用函数和依赖数组。

::: info 什么是副作用（Side Effect）？
在 React 中，"副作用"指的是与组件渲染无关的操作，比如：调用 API 获取数据、添加事件监听器、修改 document.title 等。这些操作不能直接写在组件函数体中（会在每次渲染时重复执行），需要用 `useEffect` 来管理。
:::

下面是项目中使用 `useEffect` 监听全局登出事件的真实代码：

来自 `learn-fullstack/src/App.tsx`

```tsx
// 从 react 包中导入 useEffect Hook
import { useEffect } from 'react'
// 从 react-router-dom 导入 useNavigate Hook，用于编程式导航
import { useNavigate } from 'react-router-dom'
// 从认证上下文中导入 useAuth Hook，获取登出函数
import { useAuth } from './contexts/AuthContext'

function App() {
  // 从认证上下文中解构出 logout 函数
  const { logout } = useAuth()
  // 获取导航函数，用于编程式跳转页面
  const navigate = useNavigate()

  // useEffect 接收两个参数：副作用函数和依赖数组
  useEffect(() => {
    // 定义事件处理函数：执行登出操作并跳转到登录页
    const handler = () => { logout(); navigate('/login') }
    // 在 window 上监听自定义事件 'auth:logout'
    // 当 API 返回 401 时，api.ts 中的 unwrap 函数会触发这个事件
    window.addEventListener('auth:logout', handler)
    // 返回清理函数：组件卸载时移除事件监听器，防止内存泄漏
    return () => window.removeEventListener('auth:logout', handler)
  }, [logout, navigate]) // 依赖数组：当 logout 或 navigate 变化时重新执行副作用
  // ...
}
```

**useEffect 的执行时机：**

| 依赖数组 | 执行时机 | 示例 |
|---------|---------|------|
| `[]`（空数组） | 只在组件首次挂载时执行一次 | 初始化数据加载 |
| `[a, b]`（有依赖） | 首次挂载 + 依赖变化时执行 | 监听特定状态变化 |
| 不传依赖数组 | 每次渲染后都执行 | 很少使用，容易造成性能问题 |

::: tip 清理函数的作用
`useEffect` 返回的函数叫做"清理函数"（cleanup function）。React 会在组件卸载时自动调用它。上面的例子中，清理函数移除了事件监听器，避免组件已经不存在了还在响应事件（这就是"内存泄漏"）。
:::

### useContext — 全局状态共享

`useContext` 用于读取 React Context 中的共享数据，避免通过 props 层层传递（也叫"prop drilling"）。本项目用它来实现全局认证状态的共享。

::: info 什么是 Context？
React Context 是一种跨组件传递数据的机制。你可以把它想象成一个"全局变量容器"：在顶层组件中放入数据（Provider），在任意子组件中取出数据（useContext），不需要通过 props 一层一层传递。
:::

来自 `learn-fullstack/src/contexts/AuthContext.tsx`

```tsx
// 从 react 中导入 useContext Hook
import { useContext } from 'react'

// useAuth 是一个自定义 Hook，封装了 useContext 的调用
// 其他组件只需要调用 useAuth() 就能获取认证状态，不需要直接操作 Context
export function useAuth(): AuthContextValue {
  // 调用 useContext 读取 AuthContext 中的值
  // AuthContext 是通过 createContext 创建的上下文对象（后面会详细讲解）
  const ctx = useContext(AuthContext)
  // 如果 ctx 为 null，说明 useAuth 在 AuthProvider 外部被调用了
  // 抛出错误提示开发者必须在 AuthProvider 内部使用
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  // 返回上下文值，包含 token、username、isAuthenticated、login、logout
  return ctx
}
```

在组件中使用 `useAuth`：

```tsx
// 在任意子组件中调用 useAuth 获取认证状态
function SomeComponent() {
  // 解构出需要的认证信息和方法
  // token: JWT 令牌字符串
  // username: 当前登录用户名
  // isAuthenticated: 是否已登录（布尔值）
  // logout: 登出函数
  const { token, username, isAuthenticated, logout } = useAuth()
  // ...
}
```

**三个核心 Hook 的对比：**

| Hook | 用途 | 触发重渲染 |
|------|------|-----------|
| `useState` | 管理组件内部状态 | 调用 setter 函数时触发 |
| `useEffect` | 处理副作用（API 调用、事件监听等） | 不直接触发，但副作用中可能更新状态 |
| `useContext` | 读取全局共享数据 | Context 值变化时触发 |


## TypeScript 类型定义

TypeScript 的类型系统是本项目的重要基础。通过类型定义，我们可以在编码阶段就发现数据结构不匹配的错误，而不是等到运行时才出问题。

本项目的类型定义集中在 `src/types/index.ts` 文件中，主要使用了 `interface`（接口）、泛型、联合类型等 TypeScript 特性。

### interface — 定义数据模型

`interface` 用于定义对象的形状（shape），规定对象必须包含哪些属性以及每个属性的类型。

::: info 什么是 interface？
`interface` 可以理解为一份"数据合同"：它规定了一个对象必须长什么样。如果你创建的对象缺少了必需属性或者属性类型不对，TypeScript 编译器会立刻报错。
:::

来自 `learn-fullstack/src/types/index.ts`

```typescript
// 定义 User 接口，描述用户数据的结构
// export 关键字表示这个类型可以被其他文件导入使用
export interface User {
  // 用户唯一标识，number 类型
  id: number;
  // 用户显示名称，string 类型
  name: string;
  // 用户登录名，string 类型
  username: string;
  // 用户邮箱地址，string 类型
  email: string;
  // 用户电话号码，string 类型
  phone: string;
  // 用户个人网站，string 类型
  website: string;
  // 用户所在城市，string 类型，? 表示可选属性（可以不存在）
  city?: string;
  // 用户所在公司，string 类型，? 表示可选属性
  company?: string;
}
```

```typescript
// 定义 Post 接口，描述文章数据的结构
export interface Post {
  // 文章唯一标识
  id: number;
  // 文章作者的用户 ID，用于关联 User
  userId: number;
  // 文章标题
  title: string;
  // 文章正文内容
  body: string;
}
```

```typescript
// 定义 SaveResult 接口，描述批量保存操作的返回结果
export interface SaveResult {
  // 操作是否成功
  success: boolean;
  // 成功保存的记录数
  savedCount: number;
  // 成功更新的记录数
  updatedCount: number;
  // 保存失败的记录数
  failedCount: number;
  // 操作结果的描述信息
  message: string;
}
```

::: tip 可选属性（Optional Properties）
属性名后面加 `?` 表示该属性是可选的。比如 `city?: string` 表示 `city` 属性可以存在也可以不存在。这在处理外部 API 返回的数据时非常有用，因为有些字段可能不是每条记录都有。
:::

### 泛型类型 — ApiResponse&lt;T&gt;

泛型（Generics）让你定义一个"模板类型"，在使用时再指定具体的类型参数。本项目中 `ApiResponse<T>` 就是一个泛型接口，用于统一后端 API 的响应格式。

::: info 什么是泛型？
泛型就像函数的参数，但它是"类型的参数"。`ApiResponse<T>` 中的 `T` 是一个类型占位符，使用时可以替换为任意类型：`ApiResponse<User[]>` 表示 data 字段是用户数组，`ApiResponse<SaveResult>` 表示 data 字段是保存结果。这样一个接口就能描述所有 API 响应的格式。
:::

来自 `learn-fullstack/src/services/api.ts`

```typescript
// 定义泛型接口 ApiResponse，T 是类型参数
// 所有后端 API 都返回这个统一格式，只是 data 字段的类型不同
interface ApiResponse<T> {
  // 请求是否成功
  success: boolean;
  // 响应数据，类型由泛型参数 T 决定
  // 比如获取用户列表时 T 是 User[]，保存数据时 T 是 SaveResult
  data: T;
  // 响应消息（成功提示或错误描述）
  message: string;
}
```

**泛型的实际使用示例：**

```typescript
// 当 T = User[] 时，ApiResponse<User[]> 等价于：
// { success: boolean; data: User[]; message: string }

// 当 T = SaveResult 时，ApiResponse<SaveResult> 等价于：
// { success: boolean; data: SaveResult; message: string }

// 当 T = null 时，ApiResponse<null> 等价于：
// { success: boolean; data: null; message: string }
```

### 联合类型 — DataSource

联合类型（Union Type）用 `|` 符号连接多个类型，表示一个值可以是其中任意一种类型。

::: info 什么是联合类型？
联合类型就像一个"多选一"的约束。`DataSource = 'users' | 'posts'` 表示这个变量只能是 `'users'` 或 `'posts'` 这两个字符串之一，赋值为其他字符串会报错。这比用普通 `string` 类型更安全，因为编译器能帮你检查拼写错误。
:::

来自 `learn-fullstack/src/types/index.ts`

```typescript
// 定义联合类型 SyncStep，表示同步操作的各个步骤
// 只能是这六个字符串字面量之一
export type SyncStep = 'idle' | 'fetching' | 'saving' | 'querying' | 'done' | 'error';

// 定义联合类型 DataSource，表示数据来源
// 只能是 'users' 或 'posts'
export type DataSource = 'users' | 'posts';
```

在组件中使用联合类型：

```tsx
// useState 的泛型参数使用联合类型
// activeSource 只能被设置为 'users'、'posts' 或 'playground'
const [activeSource, setActiveSource] = useState<DataSource | 'playground'>('users')

// 如果尝试设置为其他值，TypeScript 会报错：
// setActiveSource('invalid') // ❌ 类型错误！
// setActiveSource('users')   // ✅ 正确
```

### 类型守卫

类型守卫（Type Guard）是一种在运行时检查变量类型的技术，让 TypeScript 在条件分支中自动收窄类型范围。

::: info 什么是类型守卫？
当一个变量的类型是联合类型时（比如 `string | null`），你不能直接当作 `string` 使用。类型守卫通过条件判断告诉 TypeScript："在这个 if 分支里，这个变量一定是某个具体类型"，从而安全地使用该类型的方法和属性。
:::

来自 `learn-fullstack/src/contexts/AuthContext.tsx`

```tsx
// parseUsername 函数展示了类型守卫的实际应用
// 返回类型是 string | null，表示可能解析成功也可能失败
function parseUsername(token: string): string | null {
  // try-catch 块处理可能的解析错误
  try {
    // 解析 JWT Token 的 payload 部分（Base64 解码后转为 JSON 对象）
    const payload = JSON.parse(atob(token.split('.')[1]))
    // 使用空值合并运算符 ??：如果 payload.sub 存在则返回它，否则返回 null
    // payload.sub 是 JWT 标准字段，存储用户标识（subject）
    return payload.sub ?? null
  } catch {
    // 如果 Token 格式不正确或解析失败，返回 null
    return null
  }
}

// 在 AuthProvider 中使用类型守卫
export function AuthProvider({ children }: { children: ReactNode }) {
  // token 的类型是 string | null
  const [token, setToken] = useState<string | null>(
    // 初始化时从 localStorage 读取已保存的 Token
    () => localStorage.getItem(TOKEN_KEY)
  )

  // 这里就是类型守卫的应用：
  // token ? parseUsername(token) : null
  // 三元表达式检查 token 是否为真值（非 null）
  // 在 ? 后面的分支中，TypeScript 知道 token 一定是 string 类型
  // 所以可以安全地传给 parseUsername 函数
  const username = token ? parseUsername(token) : null
  // ...
}
```


## React Router 路由配置与路由守卫

[React Router](https://reactrouter.com/) 是 React 生态中最流行的路由库，用于实现单页应用（SPA）的页面导航。本项目使用 React Router v7 来管理页面路由，并实现了路由守卫（ProtectedRoute）来保护需要登录才能访问的页面。

### 路由基础配置

React Router 的核心组件有三个：`BrowserRouter`（路由容器）、`Routes`（路由集合）和 `Route`（单条路由规则）。

::: info 什么是 SPA 路由？
传统网站每次点击链接都会向服务器请求一个新的 HTML 页面。SPA（单页应用）只有一个 HTML 页面，通过 JavaScript 动态切换页面内容。React Router 就是负责管理这种"假导航"的工具——URL 变了，但页面不会重新加载，只是组件切换了。
:::

来自 `learn-fullstack/src/App.tsx`

```tsx
// 从 react-router-dom 导入路由相关组件
// BrowserRouter：使用浏览器 History API 的路由容器
// Routes：路由规则的容器，类似 switch-case
// Route：单条路由规则，定义 URL 路径和对应的组件
import { BrowserRouter, Routes, Route } from 'react-router-dom'
// 导入认证上下文的 Provider 组件
import { AuthProvider } from './contexts/AuthContext'
// 导入登录页面组件
import { LoginPage } from './components/LoginPage'
// 导入路由守卫组件
import { ProtectedRoute } from './components/ProtectedRoute'

// AppWithAuth 是应用的最外层组件，负责组装路由和认证上下文
function AppWithAuth() {
  return (
    // BrowserRouter 是路由的最外层容器
    // 它使用浏览器的 History API（pushState/popState）来管理 URL
    // 整个应用只需要一个 BrowserRouter
    <BrowserRouter>
      {/* AuthProvider 包裹在 Routes 外面，让所有路由页面都能访问认证状态 */}
      <AuthProvider>
        {/* Routes 组件包含所有路由规则，React Router 会根据当前 URL 匹配对应的 Route */}
        <Routes>
          {/* 登录页路由：当 URL 为 /login 时，渲染 LoginPage 组件 */}
          {/* 登录页不需要认证，所以直接渲染，不包裹 ProtectedRoute */}
          <Route path="/login" element={<LoginPage />} />
          {/* 通配路由：path="/*" 匹配所有其他路径 */}
          {/* 用 ProtectedRoute 包裹 App 组件，未登录用户会被重定向到登录页 */}
          <Route path="/*" element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

**路由匹配规则：**

| URL 路径 | 匹配的 Route | 渲染的组件 | 是否需要登录 |
|---------|-------------|-----------|------------|
| `/login` | `path="/login"` | `LoginPage` | 否 |
| `/` | `path="/*"` | `ProtectedRoute > App` | 是 |
| `/任意路径` | `path="/*"` | `ProtectedRoute > App` | 是 |

**组件嵌套关系：**

```
BrowserRouter          ← 路由容器（管理 URL）
  └── AuthProvider     ← 认证上下文（提供登录状态）
       └── Routes      ← 路由匹配器
            ├── Route /login → LoginPage        ← 公开页面
            └── Route /* → ProtectedRoute       ← 受保护页面
                              └── App           ← 主应用
```

### ProtectedRoute — 路由守卫

路由守卫是一种设计模式：在用户访问某个页面之前，先检查是否满足条件（比如是否已登录），不满足则重定向到其他页面。

::: info 什么是路由守卫？
路由守卫就像一个"门卫"：用户想进入某个页面时，守卫先检查用户是否有权限。有权限就放行，没权限就把用户带到登录页。这样可以防止未登录用户直接通过 URL 访问受保护的页面。
:::

来自 `learn-fullstack/src/components/ProtectedRoute.tsx`

```tsx
// 从 react-router-dom 导入 Navigate 组件，用于编程式重定向
import { Navigate } from 'react-router-dom'
// 从认证上下文导入 useAuth Hook
import { useAuth } from '../contexts/AuthContext'
// 从 react 导入 ReactNode 类型，表示任意合法的 React 子元素
import { type ReactNode } from 'react'

// ProtectedRoute 组件：路由守卫
// 接收 children 属性，类型为 ReactNode（可以是任意 React 元素）
export function ProtectedRoute({ children }: { children: ReactNode }) {
  // 从认证上下文中获取 isAuthenticated（是否已登录）
  const { isAuthenticated } = useAuth()
  // 如果未登录，使用 Navigate 组件重定向到 /login 页面
  // replace 属性表示替换当前历史记录（用户点击浏览器"后退"不会回到受保护页面）
  if (!isAuthenticated) return <Navigate to="/login" replace />
  // 如果已登录，渲染子组件（即被保护的页面内容）
  // <></> 是 React Fragment 的简写，不会在 DOM 中产生额外的节点
  return <>{children}</>
}
```

**路由守卫的工作流程：**

```
用户访问 /dashboard
    ↓
React Router 匹配到 path="/*"
    ↓
渲染 ProtectedRoute 组件
    ↓
调用 useAuth() 检查登录状态
    ↓
├── 已登录 → 渲染 children（App 组件）→ 用户看到页面内容
└── 未登录 → 渲染 <Navigate to="/login" /> → 用户被重定向到登录页
```


## AuthContext 认证上下文

AuthContext 是本项目的认证核心，使用 React Context API 实现全局认证状态管理。它负责 JWT Token 的存储、读取、登录和登出操作，让任意组件都能访问当前用户的认证信息。

如果你想了解后端 JWT 认证的实现，可以参考 [后端知识点详解](/backend/spring-boot/backend-knowledge) 中的 JWT 章节，或者阅读 [Java 零基础入门笔记](/backend/java/java-zero-to-one) 了解 Java 基础。

### Context 创建与类型定义

来自 `learn-fullstack/src/contexts/AuthContext.tsx`

```tsx
// 从 react 中导入 createContext 函数和相关类型
// createContext：创建一个 Context 对象
// useContext：读取 Context 中的值
// useState：管理组件状态
// ReactNode：React 子元素的类型（用于 children 属性）
import { createContext, useContext, useState, type ReactNode } from 'react'

// 定义常量：localStorage 中存储 JWT Token 的键名
const TOKEN_KEY = 'jwt_token'
```

```tsx
// 定义 AuthContext 的值的类型接口
// 所有通过 useAuth() 获取的数据和方法都在这里声明
interface AuthContextValue {
  // 当前的 JWT Token 字符串，未登录时为 null
  token: string | null
  // 当前登录用户的用户名，未登录时为 null
  username: string | null
  // 是否已认证（已登录），布尔值
  isAuthenticated: boolean
  // 登录函数：接收 JWT Token 字符串，保存到状态和 localStorage
  login: (token: string) => void
  // 登出函数：清除 Token 和状态
  logout: () => void
}

// 使用 createContext 创建认证上下文
// 泛型参数 AuthContextValue | null 表示上下文值的类型
// 初始值为 null，表示在 Provider 外部使用时没有值
const AuthContext = createContext<AuthContextValue | null>(null)
```

### Provider 组件 — 提供认证状态

Provider 组件是 Context 的"数据提供者"，它包裹在组件树的外层，让所有子组件都能通过 `useContext` 访问认证数据。

::: info 什么是 Provider？
Provider 就像一个"广播站"：它持有数据，并向所有被它包裹的子组件"广播"这些数据。子组件通过 `useContext`（或自定义 Hook `useAuth`）来"收听"广播，获取最新的数据。当 Provider 中的数据变化时，所有"收听"的子组件会自动重新渲染。
:::

来自 `learn-fullstack/src/contexts/AuthContext.tsx`

```tsx
// 解析 JWT Token 中的用户名
// JWT Token 由三部分组成：header.payload.signature，用 . 分隔
function parseUsername(token: string): string | null {
  try {
    // token.split('.')[1] 获取 payload 部分（第二段）
    // atob() 对 Base64 编码的 payload 进行解码
    // JSON.parse() 将解码后的字符串转为 JavaScript 对象
    const payload = JSON.parse(atob(token.split('.')[1]))
    // payload.sub 是 JWT 标准字段 "subject"，通常存储用户标识
    // ?? null 是空值合并：如果 payload.sub 是 undefined 或 null，则返回 null
    return payload.sub ?? null
  } catch {
    // 如果 Token 格式不正确（不是合法的 JWT），捕获异常并返回 null
    return null
  }
}

// AuthProvider 组件：认证上下文的 Provider
// 接收 children 属性，渲染被包裹的子组件
export function AuthProvider({ children }: { children: ReactNode }) {
  // 使用 useState 管理 Token 状态
  // 初始值使用函数形式（惰性初始化）：只在组件首次渲染时执行
  // 从 localStorage 中读取之前保存的 Token（实现页面刷新后保持登录状态）
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  )

  // 根据 Token 解析用户名
  // 如果 token 存在（非 null），调用 parseUsername 解析；否则 username 为 null
  const username = token ? parseUsername(token) : null

  // 登录函数：保存新的 Token
  const login = (newToken: string) => {
    // 将 Token 持久化到 localStorage（页面刷新后仍然存在）
    localStorage.setItem(TOKEN_KEY, newToken)
    // 更新 React 状态，触发组件重新渲染
    setToken(newToken)
  }

  // 登出函数：清除 Token
  const logout = () => {
    // 从 localStorage 中移除 Token
    localStorage.removeItem(TOKEN_KEY)
    // 将状态设为 null，触发重新渲染
    // 所有依赖 isAuthenticated 的组件（如 ProtectedRoute）会自动响应
    setToken(null)
  }

  // 渲染 Provider 组件，通过 value 属性向下传递认证数据
  // !!token 将 token 转为布尔值：有 Token 为 true（已登录），null 为 false（未登录）
  return (
    <AuthContext.Provider value={{ token, username, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### useAuth Hook — 消费认证状态

`useAuth` 是一个自定义 Hook，封装了 `useContext(AuthContext)` 的调用，并添加了错误检查。

来自 `learn-fullstack/src/contexts/AuthContext.tsx`

```tsx
// 自定义 Hook：获取认证上下文的值
// 返回类型为 AuthContextValue，包含 token、username、isAuthenticated、login、logout
export function useAuth(): AuthContextValue {
  // 调用 useContext 读取最近的 AuthContext.Provider 提供的值
  const ctx = useContext(AuthContext)
  // 安全检查：如果 ctx 为 null，说明组件不在 AuthProvider 内部
  // 抛出明确的错误信息，帮助开发者快速定位问题
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  // 返回认证上下文值
  return ctx
}
```

### JWT Token 存储和读取流程

```
登录流程：
  用户输入账号密码 → 调用后端登录 API → 获取 JWT Token
      ↓
  调用 login(token) → localStorage.setItem() + setToken()
      ↓
  isAuthenticated 变为 true → ProtectedRoute 放行 → 用户看到主页面

页面刷新：
  AuthProvider 初始化 → useState(() => localStorage.getItem(TOKEN_KEY))
      ↓
  如果 localStorage 中有 Token → isAuthenticated 为 true → 保持登录状态
  如果 localStorage 中没有 Token → isAuthenticated 为 false → 重定向到登录页

登出流程：
  调用 logout() → localStorage.removeItem() + setToken(null)
      ↓
  isAuthenticated 变为 false → ProtectedRoute 重定向到 /login
```

::: tip 为什么用 localStorage 存储 Token？
`localStorage` 是浏览器提供的持久化存储，数据在页面刷新甚至关闭浏览器后仍然存在。将 JWT Token 存在 `localStorage` 中，用户刷新页面后不需要重新登录。但要注意，`localStorage` 容易受到 XSS 攻击，生产环境中更安全的做法是使用 HttpOnly Cookie。
:::


## API 请求封装

本项目在 `src/services/api.ts` 中实现了统一的 API 请求封装，包括自动携带 JWT Token 的 `authFetch` 函数和统一响应解包的 `unwrap` 函数。这种封装避免了在每个 API 调用中重复编写认证和错误处理逻辑。

### 常量与基础配置

来自 `learn-fullstack/src/services/api.ts`

```typescript
// 导入项目中定义的类型
import type { User, RawUser, Post, SaveResult } from '../types';

// localStorage 中存储 JWT Token 的键名（与 AuthContext 中保持一致）
const TOKEN_KEY = 'jwt_token'
// 自定义事件名：当 Token 过期时触发此事件，通知 App 组件执行登出
const AUTH_LOGOUT_EVENT = 'auth:logout'

// API 基础地址：优先使用环境变量 VITE_API_BASE_URL，如果未设置则默认使用本地开发地址
// import.meta.env 是 Vite 提供的环境变量访问方式（后面会详细讲解）
// || 是逻辑或运算符：左边为空字符串或 undefined 时使用右边的默认值
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '/api';
// JSONPlaceholder 是一个免费的在线 REST API，提供测试用的假数据
const JSONPLACEHOLDER_URL = 'https://jsonplaceholder.typicode.com';
```

### authFetch — 自动携带 Token

`authFetch` 是对浏览器原生 `fetch` 函数的封装，它会自动从 `localStorage` 读取 JWT Token 并添加到请求头中。

::: info 为什么需要 authFetch？
每次调用后端 API 都需要在请求头中携带 JWT Token 来证明身份。如果每个 API 调用都手动添加 Token，代码会非常重复。`authFetch` 把这个逻辑统一封装，调用者只需要关心请求的 URL 和参数，不需要操心认证细节。
:::

来自 `learn-fullstack/src/services/api.ts`

```typescript
// authFetch 函数：带认证的 fetch 封装
// 参数 url：请求地址
// 参数 options：fetch 的配置选项（方法、请求体等），默认为空对象
// 返回值：Promise<Response>，与原生 fetch 返回类型一致
function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // 从 localStorage 中读取当前的 JWT Token
  const token = localStorage.getItem(TOKEN_KEY)
  // 判断是否是认证相关的路由（登录/注册接口不需要携带 Token）
  const isAuthRoute = url.includes('/auth/')
  // 构建请求头对象
  // 默认设置 Content-Type 为 JSON 格式
  // 使用展开运算符 ... 合并调用者传入的自定义请求头
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  // 如果有 Token 且不是认证路由，则在请求头中添加 Authorization 字段
  // Bearer 是 JWT 的标准认证方案前缀
  if (token && !isAuthRoute) {
    headers['Authorization'] = `Bearer ${token}`
  }
  // 调用原生 fetch，合并 options 和构建好的 headers
  // 展开运算符 ...options 保留调用者传入的其他配置（如 method、body）
  return fetch(url, { ...options, headers })
}
```

### unwrap — 统一响应解包

`unwrap` 函数负责解析后端返回的统一响应格式（`ApiResponse<T>`），提取出 `data` 字段，并统一处理错误情况。

::: info 什么是响应解包？
后端 API 返回的数据格式是 `{ success: true, data: {...}, message: "ok" }`，但前端组件只关心 `data` 部分。`unwrap` 函数就是把外层的"包装"去掉，直接返回 `data`。同时它还处理了 401 未认证和其他 HTTP 错误，让调用者不需要重复编写错误处理代码。
:::

来自 `learn-fullstack/src/services/api.ts`

```typescript
// unwrap 泛型函数：解包 API 响应
// 泛型参数 T 表示 data 字段的类型（由调用者指定）
// 参数 response：fetch 返回的原始 Response 对象
// 返回值：Promise<T>，直接返回解包后的 data 数据
async function unwrap<T>(response: Response): Promise<T> {
  // 首先检查 HTTP 状态码是否为 401（未认证/Token 过期）
  if (response.status === 401) {
    // 触发自定义事件 'auth:logout'
    // App.tsx 中的 useEffect 监听了这个事件，会执行登出并跳转到登录页
    window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT))
    // 抛出错误，中断后续逻辑
    throw new Error('认证已过期，请重新登录')
  }
  // 检查 HTTP 响应是否成功（状态码 200-299）
  if (!response.ok) {
    // 尝试解析错误响应的 JSON 内容
    // .catch() 处理响应体不是 JSON 的情况，回退使用 HTTP 状态文本
    const err: ApiResponse<null> = await response.json().catch(() => ({ message: response.statusText }));
    // 抛出包含错误信息的 Error 对象
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  // 解析成功响应的 JSON 内容，类型断言为 ApiResponse<T>
  const body: ApiResponse<T> = await response.json();
  // 返回 data 字段，去掉外层的 success 和 message 包装
  return body.data;
}
```

### 实际 API 调用示例

下面是使用 `authFetch` 和 `unwrap` 组合调用后端 API 的实际代码：

来自 `learn-fullstack/src/services/api.ts`

```typescript
// 获取外部用户数据（从 JSONPlaceholder 公共 API）
// 这个接口不需要认证，所以直接使用原生 fetch
export async function fetchExternalUsers(): Promise<User[]> {
  // 调用 JSONPlaceholder 的 /users 接口
  const res = await fetch(`${JSONPLACEHOLDER_URL}/users`);
  // 检查响应是否成功
  if (!res.ok) throw new Error('获取外部用户数据失败');
  // 解析 JSON 响应，类型为 RawUser 数组（原始格式，包含嵌套的 address 和 company）
  const rawUsers: RawUser[] = await res.json();
  // 将原始用户数据转换为项目内部的 User 格式（扁平化处理）
  return rawUsers.map(transformRawUser);
}

// 批量保存用户数据到后端（需要认证）
// 使用 authFetch 自动携带 Token，使用 unwrap 自动解包响应
export async function saveUsersToBackend(users: User[]): Promise<SaveResult> {
  // authFetch 自动添加 Authorization 请求头
  // unwrap<SaveResult> 指定返回数据的类型为 SaveResult
  // await authFetch(...) 先获取 Response，再传给 unwrap 解包
  return unwrap<SaveResult>(await authFetch(`${API_BASE}/users/batch`, {
    // HTTP 方法为 POST（创建/提交数据）
    method: 'POST',
    // 将 users 数组序列化为 JSON 字符串作为请求体
    body: JSON.stringify(users),
  }));
}
```

**authFetch + unwrap 的协作流程：**

```
组件调用 saveUsersToBackend(users)
    ↓
authFetch 构建请求：
  - 自动添加 Content-Type: application/json
  - 自动添加 Authorization: Bearer <token>
  - 发送 POST 请求到后端
    ↓
unwrap 处理响应：
  ├── 401 → 触发 auth:logout 事件 → App 执行登出
  ├── 其他错误 → 抛出 Error（包含错误信息）
  └── 成功 → 解析 JSON → 返回 body.data（SaveResult）
    ↓
组件获取到 SaveResult 数据，更新 UI
```


## 环境变量使用

环境变量用于管理不同运行环境（开发、生产）下的配置差异。本项目使用 Vite 的环境变量机制，通过 `.env` 文件配置 API 地址等参数。

### .env.local 与 .env.production 的区别

::: info 什么是环境变量？
环境变量是在应用运行之前就设定好的配置值。比如开发时后端运行在 `localhost:8080`，部署到线上后后端地址变成了 `https://howyc-github-io.onrender.com`。通过环境变量，同一份代码可以在不同环境下使用不同的配置，而不需要修改源码。
:::

| 文件 | 加载时机 | 用途 |
|------|---------|------|
| `.env.local` | 本地开发（`npm run dev`） | 本地开发环境配置，不提交到 Git |
| `.env.production` | 生产构建（`npm run build`） | 生产环境配置，提交到 Git |

本项目的环境变量配置：

```bash
# .env.local — 本地开发环境
# 本地开发时不需要设置 VITE_API_BASE_URL
# api.ts 中会使用默认值 http://localhost:8080
```

```bash
# .env.production — 生产环境
# 设置后端 API 的生产环境地址
# 部署到 Vercel 后，前端会使用这个地址调用后端 API
VITE_API_BASE_URL=https://howyc-github-io.onrender.com
```

### import.meta.env — 访问环境变量

Vite 使用 `import.meta.env` 对象来访问环境变量。这是 Vite 特有的方式，与 Webpack 的 `process.env` 不同。

::: info 什么是 import.meta.env？
`import.meta.env` 是 Vite 在构建时注入的一个特殊对象，包含了所有以 `VITE_` 开头的环境变量。Vite 在编译阶段会把 `import.meta.env.VITE_XXX` 替换为实际的值（字符串替换），所以最终打包出来的代码中不会包含 `import.meta.env`，而是直接包含具体的值。
:::

来自 `learn-fullstack/src/services/api.ts`

```typescript
// 使用 import.meta.env 访问环境变量 VITE_API_BASE_URL
// import.meta.env.VITE_API_BASE_URL 在开发环境中为 undefined（.env.local 中未设置）
// 在生产环境中为 'https://howyc-github-io.onrender.com'（.env.production 中设置）
// || 运算符：如果环境变量未设置（undefined 或空字符串），使用默认值 'http://localhost:8080'
// 最后拼接 '/api' 前缀，得到完整的 API 基础路径
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '/api';
```

**不同环境下 API_BASE 的值：**

| 环境 | VITE_API_BASE_URL | API_BASE 最终值 |
|------|-------------------|----------------|
| 本地开发 | `undefined` | `http://localhost:8080/api` |
| 生产构建 | `https://howyc-github-io.onrender.com` | `https://howyc-github-io.onrender.com/api` |

### VITE_ 前缀的作用

::: warning 重要安全机制
Vite 只会将以 `VITE_` 开头的环境变量暴露给前端代码。这是一个安全机制：防止敏感信息（如数据库密码、API 密钥）被意外打包到前端代码中。前端代码最终会被发送到用户的浏览器，任何人都可以查看，所以绝对不能包含敏感信息。
:::

```bash
# ✅ 以 VITE_ 开头 — 会被暴露给前端代码
VITE_API_BASE_URL=https://example.com    # 前端可以通过 import.meta.env.VITE_API_BASE_URL 访问

# ❌ 不以 VITE_ 开头 — 不会暴露给前端代码
DB_PASSWORD=secret123                     # 前端无法访问，import.meta.env.DB_PASSWORD 是 undefined
SECRET_KEY=abc                            # 前端无法访问，只有服务端（Node.js）能读取
```

**环境变量加载优先级（从高到低）：**

| 优先级 | 文件 | 说明 |
|--------|------|------|
| 1（最高） | `.env.local` | 本地覆盖，不提交到 Git |
| 2 | `.env.production` / `.env.development` | 特定环境配置 |
| 3（最低） | `.env` | 所有环境的默认配置 |

## 小结

本章我们深入讲解了项目中使用的六大前端核心技术：

1. **React Hooks** — `useState` 管理状态、`useEffect` 处理副作用、`useContext` 共享全局数据
2. **TypeScript 类型定义** — `interface` 定义数据模型、泛型 `ApiResponse<T>` 统一响应格式、联合类型约束取值范围、类型守卫安全收窄类型
3. **React Router** — `BrowserRouter` + `Routes` + `Route` 配置路由、`ProtectedRoute` 实现路由守卫
4. **AuthContext** — Context 创建、Provider 提供数据、`useAuth` 消费数据、JWT Token 持久化存储
5. **API 请求封装** — `authFetch` 自动携带 Token、`unwrap` 统一解包响应和错误处理、401 自动登出
6. **环境变量** — `.env.local` / `.env.production` 区分环境、`import.meta.env` 访问变量、`VITE_` 前缀安全机制

这些技术构成了前端应用的核心骨架。下一章我们将进入后端世界，用前端开发者熟悉的视角来理解 Spring Boot 的三层架构和 JWT 认证。

👉 [继续阅读：第 3 章 — 后端知识点详解](/backend/spring-boot/backend-knowledge)

如果你想了解更多 Java 基础知识，可以参考 [Java 零基础入门笔记](/backend/java/java-zero-to-one)。