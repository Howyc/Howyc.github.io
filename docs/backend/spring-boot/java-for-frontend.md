# Java 前端视角

> 本文内容来自项目 `java-backend/JAVA_LEARNING.md`，从前端开发者视角解读 Spring Boot 三层架构。

::: tip
如果你是零 Java 基础，建议先读 [Java 零基础入门](./java-zero-to-one)，再来看这篇。
:::

## 三层架构

```
HTTP 请求
    ↓
Controller（接收请求，参数校验）
    ↓
Service（业务逻辑）
    ↓
Repository（数据库操作）
    ↓
Database
```

类比前端：
- Controller ≈ API Route Handler
- Service ≈ 业务逻辑函数
- Repository ≈ ORM 查询层（Prisma / TypeORM）
