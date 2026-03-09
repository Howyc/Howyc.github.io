# Java 后端学习路径

基于你已有的这个项目，按顺序学习以下内容。每个阶段都有对应的练习任务。

---

## 阶段一：理解项目结构（已完成）

你已经有了一个完整的 Spring Boot 项目，包含：

```
entity/      → 数据模型（对应数据库表）
repository/  → 数据库操作（自动生成 SQL）
service/     → 业务逻辑
controller/  → HTTP 接口
config/      → 配置（CORS 等）
```

类比前端：
```
types/       → entity/
api.ts       → repository/ + service/
App.tsx      → controller/
```

---

## 阶段二：练习任务（在现有项目上扩展）

### 练习 1：添加 Comment（评论）实体

**目标**：学会独立创建一套完整的 CRUD 接口

**步骤**：
1. 创建 `entity/Comment.java`
   - 字段：id, postId, name, email, body
   - 参考 `Post.java` 的写法

2. 创建 `repository/CommentRepository.java`
   - 继承 JpaRepository<Comment, Long>
   - 添加方法：`findByPostId(Long postId)`
   - 添加方法：`findByEmailContainingIgnoreCase(String email)`

3. 创建 `service/CommentService.java`
   - 实现：findAll, findById, findByPostId, searchByEmail, save, deleteById, batchSave

4. 创建 `controller/CommentController.java`
   - GET  /api/db/comments          → 获取所有评论
   - GET  /api/db/comments/detail?id=1     → 按 ID 获取
   - GET  /api/db/comments/by-post?postId=1 → 按帖子 ID 获取
   - GET  /api/db/comments/search?email=xxx → 按邮箱搜索
   - POST /api/comments/batch       → 批量保存
   - POST /api/db/comments          → 新增
   - PUT  /api/db/comments/update?id=1 → 更新
   - DELETE /api/db/comments/delete?id=1 → 删除

**测试数据来源**：
```
GET https://jsonplaceholder.typicode.com/comments
```

---

### 练习 2：添加数据关联查询

**目标**：学会跨表查询

**任务**：在 PostController 里添加一个接口，返回帖子的同时包含评论数量

```java
// GET /api/db/posts/with-stats
// 返回：[{ id, title, userId, commentCount }, ...]
```

**提示**：在 PostService 里注入 CommentRepository，然后：
```java
posts.stream().map(post -> {
    Map<String, Object> item = new HashMap<>();
    item.put("id", post.getId());
    item.put("title", post.getTitle());
    item.put("commentCount", commentRepository.findByPostId(post.getId()).size());
    return item;
}).collect(Collectors.toList());
```

---

### 练习 3：添加分页功能

**目标**：学会 Spring Data JPA 的分页

**任务**：给 `GET /api/db/posts` 添加分页参数

```java
// GET /api/db/posts?page=0&size=10
// 返回：{ content: [...], totalElements: 97, totalPages: 10, currentPage: 0 }
```

**提示**：
```java
// Repository 方法改为：
Page<Post> findAll(Pageable pageable);

// Controller 接收参数：
@GetMapping("/db/posts")
public Page<Post> getAll(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size
) {
    Pageable pageable = PageRequest.of(page, size);
    return postService.findAll(pageable);
}
```

---

### 练习 4：添加数据验证

**目标**：学会 Bean Validation

**任务**：给 User 和 Post 的创建接口添加参数校验

**步骤**：
1. 在 `pom.xml` 添加依赖：
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

2. 在实体类字段上加注解：
```java
@NotBlank(message = "名称不能为空")
private String name;

@Email(message = "邮箱格式不正确")
private String email;

@Size(max = 100, message = "标题不能超过100个字符")
private String title;
```

3. 在 Controller 方法参数上加 `@Valid`：
```java
@PostMapping("/db/users")
public ResponseEntity<User> createUser(@Valid @RequestBody User user) { ... }
```

---

### 练习 5：添加全局异常处理

**目标**：学会统一处理错误响应

**任务**：创建 `GlobalExceptionHandler.java`

```java
@RestControllerAdvice  // 全局异常处理器
public class GlobalExceptionHandler {

    // 处理"资源不存在"异常
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(EntityNotFoundException e) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", e.getMessage());
        return ResponseEntity.status(404).body(error);
    }

    // 处理参数校验失败
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException e) {
        // 提取所有校验错误信息
        List<String> errors = e.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(err -> err.getField() + ": " + err.getDefaultMessage())
            .collect(Collectors.toList());

        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("errors", errors);
        return ResponseEntity.status(400).body(error);
    }
}
```

---

## 阶段三：进阶学习方向

完成上面的练习后，可以继续学习：

1. **Spring Security** - 用户认证和权限控制（JWT Token）
2. **MySQL/PostgreSQL** - 换掉 SQLite，用真正的生产数据库
3. **Docker** - 把后端打包成容器，一键部署
4. **单元测试** - 用 JUnit 5 + Mockito 测试 Service 层
5. **Lombok** - 用注解自动生成 getter/setter，减少样板代码

---

## 快速参考：Spring Boot 注解对照表

| Java 注解 | 前端类比 | 作用 |
|-----------|---------|------|
| `@SpringBootApplication` | `main.tsx` | 应用入口 |
| `@RestController` | API Route handler | 处理 HTTP 请求 |
| `@GetMapping` | `app.get()` | 处理 GET 请求 |
| `@PostMapping` | `app.post()` | 处理 POST 请求 |
| `@PutMapping` | `app.put()` | 处理 PUT 请求 |
| `@DeleteMapping` | `app.delete()` | 处理 DELETE 请求 |
| `@RequestParam` | `req.query.xxx` | 获取查询参数 |
| `@PathVariable` | `req.params.xxx` | 获取路径参数 |
| `@RequestBody` | `req.body` | 获取请求体 |
| `@Service` | Custom Hook | 业务逻辑层 |
| `@Repository` | api.ts | 数据访问层 |
| `@Autowired` | `useContext()` | 依赖注入 |
| `@Entity` | TypeScript interface | 数据库表映射 |
| `@Id` | 主键字段 | 标记主键 |
| `@Column` | 字段配置 | 数据库列配置 |
