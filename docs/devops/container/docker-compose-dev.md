---
outline: deep
---

# Docker Compose 本地开发环境

> 本章讲解如何使用 Docker Compose 一键启动前后端开发环境，告别手动分别启动前端和后端的繁琐操作。
>
> 前置阅读：建议先阅读 [后端部署](/devops/backend-deploy/backend-deployment) 了解 Dockerfile 基础知识。

## 为什么需要 Docker Compose？

在全栈项目中，本地开发通常需要同时启动多个服务：

```
手动启动流程（繁琐）：
终端 1：cd java-backend && mvn spring-boot:run
终端 2：cd learn-fullstack && npm run dev
```

Docker Compose 可以用一条命令启动所有服务：

```bash
docker compose up --build
```

| 对比项 | 手动启动 | Docker Compose |
|--------|---------|----------------|
| 启动命令 | 每个服务单独启动 | 一条命令全部启动 |
| 环境一致性 | 依赖本地安装的 JDK、Node | 容器内环境统一 |
| 新人上手 | 需要安装 JDK、Maven、Node | 只需安装 Docker |
| 服务编排 | 手动管理启动顺序 | 自动处理依赖关系 |

## docker-compose.yml 详解

项目根目录的 `docker-compose.yml`：

```yaml
# 本地开发环境 Docker Compose 配置
services:
  # Spring Boot 后端服务
  backend:
    build:
      context: ./java-backend      # 构建上下文：后端目录
      dockerfile: Dockerfile        # 使用已有的 Dockerfile
    ports:
      - "8080:8080"                 # 映射端口：宿主机:容器
    environment:
      - SPRING_PROFILES_ACTIVE=default  # 使用开发环境配置（SQLite）
      - JWT_SECRET=dGhpcyBpcyBhIHZlcnkgbG9uZyBzZWNyZXQga2V5IGZvciBkZXZlbG9wbWVudA==
    volumes:
      - backend-data:/app/data      # 持久化 SQLite 数据文件
    healthcheck:                    # 健康检查
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s            # Spring Boot 启动需要时间

  # React + Vite 前端服务
  frontend:
    build:
      context: ./learn-fullstack
      dockerfile: Dockerfile
    ports:
      - "5173:80"                   # 前端通过 Nginx 托管
    depends_on:
      backend:
        condition: service_started  # 等后端启动后再启动前端

volumes:
  backend-data:                     # 命名卷，数据不会随容器销毁
```

### 关键概念

**`depends_on`**：服务依赖关系。前端依赖后端，Docker Compose 会先启动后端再启动前端。

**`volumes`**：数据持久化。SQLite 数据库文件存储在命名卷中，即使容器重建数据也不会丢失。

**`healthcheck`**：健康检查。Docker 会定期检查后端是否正常运行，方便排查问题。

## 前端 Dockerfile

`learn-fullstack/Dockerfile` 采用与后端相同的多阶段构建思路：

```dockerfile
# 第一阶段：构建（类似 mvn package）
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci                          # 安装依赖
COPY . .
RUN npm run build                   # tsc + vite build → 生成 dist/

# 第二阶段：运行（Nginx 托管静态文件）
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx 配置

`learn-fullstack/nginx.conf` 处理 SPA 路由和 API 代理：

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;

    # SPA 路由：所有路径回退到 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 反向代理后端 API（容器间通过服务名通信）
    location /api/ {
        proxy_pass http://backend:8080/api/;
    }
}
```

::: tip Docker 网络
Docker Compose 会自动创建一个网络，容器之间可以通过服务名（如 `backend`）互相访问，不需要用 IP 地址。这就是 `proxy_pass http://backend:8080` 能工作的原因。
:::

## 常用命令

```bash
# 构建并启动所有服务（首次使用或代码有变更时加 --build）
docker compose up --build

# 后台运行
docker compose up -d --build

# 查看运行中的服务
docker compose ps

# 查看日志
docker compose logs -f           # 所有服务
docker compose logs -f backend   # 只看后端

# 停止所有服务
docker compose down

# 停止并清除数据卷（慎用，会删除 SQLite 数据）
docker compose down -v
```

## 开发 vs Docker 对比

| 场景 | 推荐方式 | 原因 |
|------|---------|------|
| 日常开发 | 直接 `npm run dev` + `mvn spring-boot:run` | 热更新更快 |
| 新人入职 | Docker Compose | 一键启动，无需配置环境 |
| 联调测试 | Docker Compose | 环境与生产一致 |
| CI/CD | Docker Compose | 可复现的构建环境 |

::: warning 注意
Docker Compose 适合联调和测试场景。日常开发建议直接用 `npm run dev`（Vite 热更新）和 `mvn spring-boot:run`（Spring Boot DevTools 热重载），开发体验更好。
:::
