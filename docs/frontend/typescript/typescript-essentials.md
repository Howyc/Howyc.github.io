# TypeScript 项目实战要点

> 面向实际项目开发的 TypeScript 核心知识，不求全面，够用就好。

## 基础类型

```typescript
// 原始类型
const name: string = 'Howyc'
const age: number = 25
const isDev: boolean = true
const nothing: null = null
const notDefined: undefined = undefined

// 数组
const nums: number[] = [1, 2, 3]
const names: Array<string> = ['a', 'b']

// 元组：固定长度和类型的数组
const pair: [string, number] = ['age', 25]

// 枚举
enum Status {
  Active = 'active',
  Inactive = 'inactive',
}

// 字面量类型
type Theme = 'light' | 'dark'
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
```

## interface vs type

项目中最常用的两种类型定义方式，各有适用场景：

```typescript
// interface —— 适合定义对象结构，支持继承和声明合并
interface User {
  id: number
  name: string
  email: string
}

interface Admin extends User {
  role: 'admin'
  permissions: string[]
}

// type —— 适合联合类型、交叉类型、工具类型
type ApiResult<T> = {
  code: number
  data: T
  message: string
}

type ButtonVariant = 'primary' | 'secondary' | 'danger'

// 交叉类型
type UserWithToken = User & { token: string }
```

**实际项目建议**：对象结构用 `interface`，其他场景用 `type`。

## 泛型

泛型让代码可复用，项目中最常见的几种用法：

```typescript
// 1. 函数泛型
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0]
}

// 2. API 响应封装（项目中最常用）
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

async function fetchApi<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url)
  return res.json()
}

// 使用
const users = await fetchApi<User[]>('/api/users')

// 3. 泛型约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
```

## 常用工具类型

TypeScript 内置的工具类型，项目中高频使用：

```typescript
interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

// Partial —— 所有属性变可选（表单编辑场景）
type UpdateUserDto = Partial<User>

// Required —— 所有属性变必填
type CompleteUser = Required<User>

// Pick —— 选取部分属性
type UserPreview = Pick<User, 'id' | 'name'>

// Omit —— 排除部分属性（创建时不需要 id）
type CreateUserDto = Omit<User, 'id'>

// Record —— 键值对映射
type UserMap = Record<number, User>
const cache: Record<string, unknown> = {}

// ReturnType —— 获取函数返回类型
function createUser() {
  return { id: 1, name: 'test' }
}
type NewUser = ReturnType<typeof createUser>
```

## 类型断言与类型守卫

```typescript
// 类型断言 —— 你比 TS 更了解类型时使用
const input = document.getElementById('search') as HTMLInputElement
input.value = 'hello'

// 类型守卫 —— 运行时类型检查
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj
  )
}

// 使用
function processData(data: unknown) {
  if (isUser(data)) {
    console.log(data.name) // TS 知道这是 User
  }
}

// typeof 守卫
function format(value: string | number) {
  if (typeof value === 'string') {
    return value.trim()
  }
  return value.toFixed(2)
}
```

## React + TypeScript

项目中 React 组件的类型写法：

```typescript
// 1. 组件 Props
interface ButtonProps {
  text: string
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  onClick: () => void
}

const Button = ({ text, variant = 'primary', onClick }: ButtonProps) => {
  return <button className={variant} onClick={onClick}>{text}</button>
}

// 2. children 类型
interface LayoutProps {
  children: React.ReactNode
  title?: string
}

// 3. 事件类型
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value)
}

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
}

// 4. useState 泛型
const [user, setUser] = useState<User | null>(null)
const [list, setList] = useState<User[]>([])

// 5. useRef 类型
const inputRef = useRef<HTMLInputElement>(null)
const timerRef = useRef<number | null>(null)

// 6. Context 类型
interface AuthContextType {
  user: User | null
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

## 项目中的类型组织

推荐的类型文件组织方式：

```
src/
├── types/
│   ├── index.ts        # 统一导出
│   ├── api.ts          # API 相关类型
│   └── user.ts         # 业务实体类型
```

```typescript
// src/types/api.ts
export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// src/types/user.ts
export interface User {
  id: number
  name: string
  email: string
}

export type CreateUserDto = Omit<User, 'id'>
export type UpdateUserDto = Partial<CreateUserDto>

// src/types/index.ts
export * from './api'
export * from './user'
```

## tsconfig.json 关键配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

关键配置说明：
- `strict: true`：开启所有严格检查，强烈建议
- `moduleResolution: "bundler"`：Vite 项目推荐
- `paths`：路径别名，配合 vite.config.ts 的 resolve.alias 使用
