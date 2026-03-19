---
outline: deep
---

# 第 5 章：后端部署

> 本章讲解如何将 Spring Boot 后端项目部署到云端，包括 TiDB Cloud 数据库配置、Render 容器部署和 Dockerfile 多阶段构建。所有配置文件来自项目真实源码，每行配置都有中文注释。
>
> 前置阅读：建议先阅读 [后端知识点详解](/tutorials/backend-knowledge) 了解 Spring Boot 项目结构，再阅读本章效果更佳。
> 项目详情：参考 [fetch-mcp-demo 项目详解](/projects/fetch-mcp-demo) 了解完整项目架构。

## 5.1 TiDB Cloud 数据库配置

### 为什么选择 TiDB Cloud？

本项目开发环境使用 SQLite（零配置、文件数据库），但生产环境需要一个云端数据库。[TiDB Cloud](https://tidbcloud.com/) 提供免费的 Serverless 方案，兼容 MySQL 协议，非常适合个人项目部署：

| 特性 | 说明 |
|------|------|
| 免费额度 | Serverless 方案每月 25 GiB 存储 + 2.5 亿 Request Units |
| MySQL 兼容 | 使用标准 MySQL 驱动连接，Spring Boot 无需额外配置 |
| SSL 加密 | 默认启用 TLS 加密连接，数据传输安全 |
| 全球节点 | 支持 AWS 多区域部署（本项目使用 us-east-1） |

### 注册与创建集群

**第 1 步：注册账号**

1. 访问 [TiDB Cloud 官网](https://tidbcloud.com/)，点击「Start Free」
2. 可以使用 GitHub、Google 或邮箱注册
3. 完成邮箱验证后进入控制台

**第 2 步：创建 Serverless Cluster**

1. 在控制台首页点击「Create Cluster」
2. 选择「Serverless」方案（免费）
3. 选择云服务商和区域：
   - Cloud Provider: **AWS**
   - Region: **us-east-1 (N. Virginia)** — 与 Render 后端同区域，减少延迟
4. 设置集群名称（如 `my-cluster`）
5. 点击「Create」，等待集群创建完成（通常 1-2 分钟）

**第 3 步：获取连接信息**

1. 集群创建完成后，点击集群名称进入详情页
2. 点击右上角「Connect」按钮
3. 在弹出的连接对话框中：
   - Connect With: 选择「General」
   - 记录以下连接信息：

| 参数 | 示例值 | 说明 |
|------|--------|------|
| Host | `gateway01.us-east-1.prod.aws.tidbcloud.com` | 数据库主机地址 |
| Port | `4000` | TiDB 默认端口（非 MySQL 的 3306） |
| Username | `3QEwxwnQkxdTGA7.root` | 格式为 `集群前缀.用户名` |
| Password | （创建时设置） | 请妥善保存，后续无法查看 |
| Database | `test` | 默认数据库名 |

::: warning 注意事项
- **密码只显示一次**：创建集群时设置的密码只在创建时显示，请立即保存。如果忘记，需要重置密码。
- **端口是 4000**：TiDB 使用 4000 端口，不是 MySQL 默认的 3306，配置时不要搞混。
- **Username 包含前缀**：TiDB Cloud 的用户名格式是 `集群前缀.root`，不是单纯的 `root`。
- **SSL 必须开启**：TiDB Cloud 强制使用 SSL 连接，Spring Boot 配置中需要设置 `sslMode=VERIFY_IDENTITY`。
:::

### 验证连接

可以使用 MySQL 命令行工具测试连接：

```bash
# 使用 mysql 客户端连接 TiDB Cloud
# -h 指定主机地址
# -P 指定端口（大写 P）
# -u 指定用户名（包含集群前缀）
# --ssl-mode 启用 SSL 加密连接
mysql -h gateway01.us-east-1.prod.aws.tidbcloud.com -P 4000 -u '3QEwxwnQkxdTGA7.root' -p --ssl-mode=VERIFY_IDENTITY
```

连接成功后，可以运行 `SHOW DATABASES;` 确认数据库列表。

## 5.2 Render 后端部署

### 为什么选择 Render？

[Render](https://render.com/) 是一个现代化的云平台，支持 Docker 容器部署，提供免费方案：

| 特性 | 说明 |
|------|------|
| Docker 支持 | 自动检测 Dockerfile 并构建部署 |
| 免费方案 | 每月 750 小时免费实例时间 |
| 自动部署 | 连接 GitHub 仓库，push 后自动重新部署 |
| 环境变量 | 支持在控制台配置环境变量，注入到容器中 |

::: warning Render 免费版限制
- 免费实例在 15 分钟无请求后会自动休眠，下次请求需要 30-60 秒冷启动
- 免费实例的磁盘存储是临时的，重新部署后数据会丢失（所以需要外部数据库如 TiDB Cloud）
:::

### 部署步骤

**第 1 步：创建 Web Service**

1. 登录 [Render 控制台](https://dashboard.render.com/)
2. 点击「New +」→「Web Service」
3. 连接你的 GitHub 仓库（`howyc/howyc.github.io`）
4. 配置基本信息：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| Name | `howyc-github-io` | 服务名称，会生成 URL |
| Region | `Oregon (US West)` | 选择离用户近的区域 |
| Runtime | `Docker` | 使用 Dockerfile 构建 |
| Root Directory | `java-backend` | 指定后端代码所在目录 |
| Instance Type | `Free` | 免费方案 |

**第 2 步：配置环境变量**

在 Render 的「Environment」标签页中，添加以下环境变量：

| 环境变量 | 值 | 说明 |
|----------|-----|------|
| `SPRING_PROFILES_ACTIVE` | `prod` | 激活生产环境配置文件 |
| `DB_HOST` | `gateway01.us-east-1.prod.aws.tidbcloud.com` | TiDB Cloud 主机地址 |
| `DB_PORT` | `4000` | TiDB Cloud 端口 |
| `DB_NAME` | `test` | 数据库名称 |
| `DB_USERNAME` | `3QEwxwnQkxdTGA7.root` | TiDB Cloud 用户名 |
| `DB_PASSWORD` | （你的密码） | TiDB Cloud 密码 |
| `JWT_SECRET` | （自定义 Base64 字符串） | JWT 签名密钥 |

::: tip 环境变量的作用
`SPRING_PROFILES_ACTIVE=prod` 是关键配置。Spring Boot 会根据这个变量加载 `application-prod.properties` 配置文件，从而使用 TiDB Cloud 数据库而非本地 SQLite。其他 `DB_*` 变量会通过 `${}` 占位符注入到配置文件中。
:::

### 生产环境配置文件详解

来自 `java-backend/src/main/resources/application-prod.properties`：

Spring Boot 通过 Profiles 机制区分开发和生产环境。当 `SPRING_PROFILES_ACTIVE=prod` 时，会加载以下配置文件：

```properties
# 生产环境配置（Render 部署 + TiDB Cloud）
# 指定服务器监听端口为 8080（Render 默认使用此端口）
server.port=8080

# TiDB Cloud (MySQL 兼容) 数据库配置
# 连接信息通过 Render 环境变量注入
# ${DB_HOST:默认值} 语法：优先读取环境变量 DB_HOST，如果未设置则使用冒号后的默认值
# jdbc:mysql:// 表示使用 MySQL 协议连接（TiDB 兼容 MySQL）
# sslMode=VERIFY_IDENTITY 启用 SSL 并验证服务器证书（TiDB Cloud 强制要求）
# enabledTLSProtocols 指定允许的 TLS 版本
spring.datasource.url=jdbc:mysql://${DB_HOST:gateway01.us-east-1.prod.aws.tidbcloud.com}:${DB_PORT:4000}/${DB_NAME:test}?sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3
# 数据库用户名，从环境变量 DB_USERNAME 读取
spring.datasource.username=${DB_USERNAME}
# 数据库密码，从环境变量 DB_PASSWORD 读取
spring.datasource.password=${DB_PASSWORD}
# 指定 JDBC 驱动类（MySQL 驱动，TiDB 兼容）
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA（Java 持久化 API）配置
# 使用 MySQL 方言生成 SQL（类似前端的 ORM 适配器）
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
# update 模式：启动时自动更新表结构（不删除已有数据）
spring.jpa.hibernate.ddl-auto=update
# 生产环境关闭 SQL 日志输出
spring.jpa.show-sql=false

# 日志级别配置
# 生产环境只输出 WARN 及以上级别的日志（减少日志量）
logging.level.root=WARN
# 项目代码输出 INFO 级别日志（便于排查业务问题）
logging.level.com.example=INFO
```

对比开发环境配置（来自 `java-backend/src/main/resources/application.properties`）：

```properties
# 开发环境配置（本地开发）
# 服务器端口
server.port=8080
# 应用名称
spring.application.name=fetch-demo
# 开发环境使用 SQLite 文件数据库（零配置，无需安装数据库服务）
spring.datasource.url=jdbc:sqlite:./data/app.db
# SQLite JDBC 驱动
spring.datasource.driver-class-name=org.sqlite.JDBC
# SQLite 方言
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
# 自动更新表结构
spring.jpa.hibernate.ddl-auto=update
# 开发环境开启 SQL 日志（便于调试）
spring.jpa.show-sql=true
# 格式化 SQL 输出（更易读）
spring.jpa.properties.hibernate.format_sql=true
# 开发环境使用 DEBUG 级别日志
logging.level.root=INFO
logging.level.com.example=DEBUG
# 输出详细的 SQL 参数绑定信息
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
# 启用彩色日志输出
spring.output.ansi.enabled=ALWAYS
# JWT 密钥（开发环境使用默认值，生产环境必须通过环境变量覆盖）
jwt.secret=${JWT_SECRET:dGhpcyBpcyBhIHZlcnkgbG9uZyBzZWNyZXQga2V5IGZvciBkZXZlbG9wbWVudA==}
```

::: tip 开发 vs 生产环境对比
| 配置项 | 开发环境 | 生产环境 |
|--------|---------|---------|
| 数据库 | SQLite（本地文件） | TiDB Cloud（云端 MySQL） |
| SQL 日志 | 开启（DEBUG） | 关闭（WARN） |
| 日志级别 | DEBUG（详细） | WARN（精简） |
| 数据库驱动 | `org.sqlite.JDBC` | `com.mysql.cj.jdbc.Driver` |
:::

## 5.3 Dockerfile 多阶段构建

### 什么是多阶段构建？

Docker 多阶段构建（Multi-stage Build）是一种优化镜像大小的技术。类比前端：

| 阶段 | Docker 后端 | 前端类比 |
|------|------------|---------|
| 构建阶段 | Maven 编译打包 → 生成 JAR 文件 | `npm run build` → 生成 `dist/` 目录 |
| 运行阶段 | JRE 运行 JAR 文件 | Nginx 托管 `dist/` 静态文件 |

构建阶段需要完整的 JDK + Maven（约 800MB），但运行阶段只需要 JRE（约 200MB）。多阶段构建让最终镜像只包含运行所需的内容，大幅减小镜像体积。

### Dockerfile 详解

来自 `java-backend/Dockerfile`：

以下是项目使用的 Dockerfile，采用两阶段构建：第一阶段用 Maven 编译打包 Java 项目，第二阶段用精简的 JRE 运行打包好的 JAR 文件。

```dockerfile
# ===== 第一阶段：构建阶段 =====
# 使用 Maven 3.9 + JDK 17 作为构建环境（类似前端的 node:20 镜像）
# AS build 给这个阶段起名为 "build"，后续阶段可以引用
FROM maven:3.9-eclipse-temurin-17 AS build
# 设置工作目录为 /app（类似前端的 WORKDIR）
WORKDIR /app
# 先复制 pom.xml（Maven 的 package.json），利用 Docker 缓存层
# 如果 pom.xml 没变，下次构建会跳过依赖下载步骤
COPY pom.xml .
# 复制源代码目录到容器中
COPY src ./src
# 执行 Maven 打包命令（类似 npm run build）
# clean 清理旧的构建产物
# package 编译并打包成 JAR 文件
# -DskipTests 跳过测试（加快构建速度）
RUN mvn clean package -DskipTests

# ===== 第二阶段：运行阶段 =====
# 使用精简的 JRE 17 镜像（只包含 Java 运行时，不含编译工具）
# 类似前端部署时用 nginx:alpine 而非 node:20
FROM eclipse-temurin:17-jre
# 设置运行时工作目录
WORKDIR /app
# 从构建阶段（build）复制打包好的 JAR 文件到当前阶段
# --from=build 引用第一阶段的构建产物
# *.jar 匹配 target 目录下生成的 JAR 文件
COPY --from=build /app/target/*.jar app.jar

# 声明容器监听 8080 端口（与 Spring Boot 配置的 server.port 一致）
EXPOSE 8080
# 容器启动时执行的命令：用 java -jar 运行 Spring Boot 应用
# 类似前端的 CMD ["nginx", "-g", "daemon off;"]
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 构建流程图

```
Dockerfile 构建流程：

┌─────────────────────────────────────┐
│  第一阶段：maven:3.9-eclipse-temurin-17  │
│                                     │
│  1. COPY pom.xml → 复制依赖配置      │
│  2. COPY src → 复制源代码            │
│  3. mvn package → 编译打包 JAR       │
│                                     │
│  产物：/app/target/fetchdemo-0.0.1.jar │
└──────────────┬──────────────────────┘
               │ COPY --from=build
               ▼
┌─────────────────────────────────────┐
│  第二阶段：eclipse-temurin:17-jre       │
│                                     │
│  1. COPY *.jar → 复制 JAR 文件       │
│  2. EXPOSE 8080 → 声明端口          │
│  3. java -jar app.jar → 启动应用    │
│                                     │
│  最终镜像大小：约 200MB（vs 800MB+）  │
└─────────────────────────────────────┘
```

## 5.4 后端部署检查清单

### TiDB Cloud 数据库

- [ ] 已注册 TiDB Cloud 账号
- [ ] 已创建 Serverless Cluster（区域：us-east-1）
- [ ] 已记录连接信息：Host、Port、Username、Password
- [ ] 已验证数据库连接可用

### Render 环境变量

| 环境变量 | 是否配置 | 示例值 |
|----------|---------|--------|
| `SPRING_PROFILES_ACTIVE` | ☐ | `prod` |
| `DB_HOST` | ☐ | `gateway01.us-east-1.prod.aws.tidbcloud.com` |
| `DB_PORT` | ☐ | `4000` |
| `DB_NAME` | ☐ | `test` |
| `DB_USERNAME` | ☐ | `3QEwxwnQkxdTGA7.root` |
| `DB_PASSWORD` | ☐ | （你的 TiDB Cloud 密码） |
| `JWT_SECRET` | ☐ | （自定义 Base64 编码字符串） |

### Render 项目配置

- [ ] Runtime 选择 `Docker`
- [ ] Root Directory 设置为 `java-backend`
- [ ] Instance Type 选择 `Free`
- [ ] 已确认 `java-backend/Dockerfile` 存在

### 部署后验证

- [ ] 后端 API 可访问：`https://howyc-github-io.onrender.com`（首次可能需要等待冷启动）
- [ ] 数据库连接正常（注册/登录功能可用）
- [ ] JWT 认证正常（登录后能获取 Token）

## 5.5 后端部署常见问题

### 问题 1：Render 免费版重新部署后数据丢失

**现象**：每次 Render 重新部署后，之前注册的用户和发布的帖子都消失了。

**原因**：Render 免费版的磁盘存储是临时的（Ephemeral Storage）。每次重新部署会创建新的容器，旧容器的文件系统数据会被清除。如果使用 SQLite（文件数据库），数据文件会随容器销毁而丢失。

**解决方案**：使用外部数据库（如 TiDB Cloud）替代 SQLite。本项目通过 `SPRING_PROFILES_ACTIVE=prod` 切换到 TiDB Cloud，数据存储在云端数据库中，不受容器重启影响。

```
开发环境：SQLite（本地文件 ./data/app.db）→ 数据随文件存在
生产环境：TiDB Cloud（云端数据库）→ 数据持久化，不受部署影响 ✅
```

### 问题 2：CORS 跨域请求被拒绝

**现象**：前端调用后端 API 时，浏览器控制台报错 `Access to fetch at 'https://xxx.onrender.com' from origin 'https://xxx.vercel.app' has been blocked by CORS policy`。

**原因**：前端和后端部署在不同域名下（Vercel vs Render），浏览器的同源策略会阻止跨域请求。

**解决方案**：后端需要配置 CORS 允许前端域名访问。本项目在 `CorsConfig.java` 中已配置：

```java
// 来自 java-backend/src/.../config/CorsConfig.java
// CORS 配置类，允许前端跨域访问后端 API
@Configuration  // 标记为 Spring 配置类
public class CorsConfig implements WebMvcConfigurer {  // 实现 Web MVC 配置接口
    @Override
    public void addCorsMappings(CorsRegistry registry) {  // 重写 CORS 映射方法
        registry.addMapping("/**")           // 对所有路径生效
                .allowedOriginPatterns("*")  // 允许所有来源（生产环境建议限制为具体域名）
                .allowedMethods("*")         // 允许所有 HTTP 方法（GET、POST、PUT、DELETE 等）
                .allowedHeaders("*")         // 允许所有请求头
                .allowCredentials(true);     // 允许携带 Cookie/认证信息
    }
}
```

::: warning 安全建议
生产环境中，`allowedOriginPatterns("*")` 应该替换为具体的前端域名（如 `"https://your-app.vercel.app"`），避免任意网站都能调用你的 API。
:::

### 问题 3：后端环境变量未生效

**现象**：部署后后端仍然连接 SQLite 而非 TiDB Cloud。

**排查步骤**：

| 检查项 | 说明 |
|--------|------|
| `SPRING_PROFILES_ACTIVE` 是否设置为 `prod` | 没有这个变量，Spring Boot 会加载默认的 `application.properties`（SQLite 配置） |
| 环境变量名是否拼写正确 | `DB_HOST` 不是 `DATABASE_HOST`，注意大小写 |
| Render 环境变量是否保存 | 添加环境变量后需要点击「Save Changes」并重新部署 |
| 变量值是否包含多余空格 | 复制粘贴时可能带入空格，导致连接失败 |

### 问题 4：Render 冷启动慢

**现象**：一段时间没有访问后，首次请求后端 API 需要等待 30-60 秒。

**原因**：Render 免费版实例在 15 分钟无请求后会自动休眠（Spin Down）。下次请求时需要重新启动容器（Cold Start），Spring Boot 应用启动需要一定时间。

**缓解方案**：

1. **接受冷启动**：免费方案的限制，首次请求慢是正常的
2. **使用定时请求**：通过外部服务（如 [UptimeRobot](https://uptimerobot.com/)）每 14 分钟 ping 一次后端 URL，保持实例活跃
3. **升级付费方案**：Render 付费方案的实例不会休眠

更多项目细节请参考 [fetch-mcp-demo 项目详解](/projects/fetch-mcp-demo)，Java 基础语法请参考 [Java 入门笔记](/backend/java/java-zero-to-one)。