# Java 项目开发指南

## 项目结构

```
java-backend/
├── pom.xml                          # Maven 配置（类似 package.json）
└── src/main/
    ├── java/com/example/fetchdemo/  # Java 源代码
    │   ├── FetchDemoApplication.java    # 启动入口
    │   └── controller/                   # 控制器（处理 HTTP 请求）
    └── resources/
        └── application.properties   # 应用配置
```

## 常用命令

```bash
# 进入 Java 项目目录
cd java-backend

# 编译项目
mvn compile

# 运行项目
mvn spring-boot:run

# 打包项目
mvn package

# 清理并重新构建
mvn clean install
```

## 代码规范

1. 所有类和方法都需要添加中文注释
2. 使用 @RestController 创建 REST API
3. 使用 @GetMapping/@PostMapping 等注解定义路由
4. 错误处理使用 try-catch 并返回友好的错误信息

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/health | 健康检查 |
| GET | /api/github/users/{username} | 获取 GitHub 用户 |
| GET | /api/fetch?url=xxx | 通用 URL 获取 |
| GET | /api/test/users | 测试用户列表 |
| GET | /api/test/users/{id} | 单个测试用户 |

## 与前端配合

前端 React 应用运行在 http://localhost:5173
后端 Java 应用运行在 http://localhost:8080

前端调用后端示例：
```javascript
fetch('http://localhost:8080/api/github/users/octocat')
  .then(res => res.json())
  .then(data => console.log(data))
```
