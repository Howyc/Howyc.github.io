# Learn Fullstack - 全栈数据流演示

使用 Vite + React + Java Spring Boot 的全栈数据流演示应用，展示从外部 API 获取数据、存储到数据库、完整 CRUD 操作的流程。

## 技术栈

| 前端 | 后端 |
|------|------|
| Node.js 22.12.0 | Java 17+ |
| Vite 7.2.4 | Spring Boot 3.x |
| React 19.2.0 | SQLite |
| TypeScript 5.9.3 | Maven |

## 快速开始

### 1. 启动后端服务

```bash
cd java-backend
mvn spring-boot:run
```

后端运行在 http://localhost:8080

### 2. 启动前端开发服务器

```bash
cd learn-fullstack
nvm use 22.12.0
npm install
npm run dev
```

前端运行在 http://localhost:5173

## 功能特性

- 📥 从 JSONPlaceholder API 获取用户和帖子数据
- 💾 批量保存数据到 SQLite 数据库
- 🔍 多条件搜索筛选（按城市、邮箱、标题、用户ID）
- ✏️ 完整的增删改查操作
- 🎨 现代化 UI 界面

## API 接口

### 用户接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/db/users | 获取所有用户 |
| GET | /api/db/users/detail?id=1 | 按ID获取用户 |
| GET | /api/db/users/by-city?city=Beijing | 按城市查询 |
| GET | /api/db/users/search?email=xxx | 按邮箱搜索 |
| POST | /api/users/batch | 批量保存用户 |
| POST | /api/db/users | 创建用户 |
| PUT | /api/db/users/update?id=1 | 更新用户 |
| DELETE | /api/db/users/delete?id=1 | 删除用户 |

### 帖子接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/db/posts | 获取所有帖子 |
| GET | /api/db/posts/detail?id=1 | 按ID获取帖子 |
| GET | /api/db/posts/by-user?userId=1 | 按用户ID查询 |
| GET | /api/db/posts/search?title=xxx | 按标题搜索 |
| POST | /api/posts/batch | 批量保存帖子 |
| POST | /api/db/posts | 创建帖子 |
| PUT | /api/db/posts/update?id=1 | 更新帖子 |
| DELETE | /api/db/posts/delete?id=1 | 删除帖子 |

## 数据库查看

使用 DBeaver 连接 SQLite 数据库：
- 数据库文件: `java-backend/data/app.db`
- 驱动: SQLite

## 项目结构

```
learn-fullstack/           # 前端项目
├── src/
│   ├── components/       # React 组件
│   ├── services/api.ts   # API 调用
│   ├── types/index.ts    # TypeScript 类型
│   └── App.tsx           # 主组件
└── package.json

java-backend/             # 后端项目
├── src/main/java/
│   └── com/example/fetchdemo/
│       ├── controller/   # REST 控制器
│       ├── service/      # 业务逻辑
│       ├── repository/   # 数据访问
│       └── entity/       # 实体类
├── data/app.db           # SQLite 数据库
└── pom.xml
```
