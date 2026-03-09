package com.example.fetchdemo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.fetchdemo.common.ApiResponse;
import com.example.fetchdemo.entity.User;
import com.example.fetchdemo.service.UserService;

/**
 * 用户 CRUD 控制器
 *
 * =====================================================
 * Controller 层的职责
 * =====================================================
 * Controller 只做三件事：
 * 1. 接收 HTTP 请求（解析参数、请求体）
 * 2. 调用 Service 处理业务逻辑
 * 3. 返回 HTTP 响应（状态码 + 数据）
 *
 * Controller 不包含任何业务逻辑！
 * 类比前端：就像 React 组件只负责 UI，业务逻辑放在 Hook 里
 *
 * =====================================================
 * 注解说明
 * =====================================================
 * @RestController = @Controller + @ResponseBody
 *   - @Controller：标记这是一个控制器
 *   - @ResponseBody：方法返回值自动序列化为 JSON
 *   - 类比前端：就像 Express 的 router.get('/path', handler)
 *
 * @RequestMapping("/api")：所有接口的 URL 前缀是 /api
 *
 * =====================================================
 * ResponseEntity<T> 是什么？
 * =====================================================
 * ResponseEntity 让你完全控制 HTTP 响应：
 *   ResponseEntity.ok(body)                    → 200 OK
 *   ResponseEntity.status(HttpStatus.CREATED)  → 201 Created
 *   ResponseEntity.status(HttpStatus.NOT_FOUND)→ 404 Not Found
 *   ResponseEntity.badRequest()                → 400 Bad Request
 *
 * 类比前端 Express：
 *   res.status(200).json(data)
 *   res.status(404).json({ error: "not found" })
 *
 * =====================================================
 * 接口路由总览
 * =====================================================
 * GET    /api/db/users              → 获取所有用户
 * GET    /api/db/users/detail?id=1  → 按 ID 查询
 * GET    /api/db/users/by-city?city=Beijing → 按城市查询
 * GET    /api/db/users/search?email=xxx     → 邮箱搜索
 * GET    /api/db/count              → 用户总数
 * GET    /api/db/cities             → 所有城市
 * GET    /api/db/companies          → 所有公司
 * GET    /api/db/stats              → 统计信息
 * POST   /api/db/users              → 新增用户
 * PUT    /api/db/users/update?id=1  → 更新用户
 * DELETE /api/db/users/delete?id=1  → 删除用户
 * POST   /api/users/batch           → 批量保存
 * POST   /api/db/fetch-users        → 从外部 API 获取
 */
@RestController
@RequestMapping("/api")
public class DatabaseController {

    private final UserService userService;

    /**
     * 构造函数注入 UserService
     * Spring 启动时自动注入，不需要手动 new
     */
    @Autowired
    public DatabaseController(UserService userService) {
        this.userService = userService;
    }

    // ============================================
    // 查询接口
    // ============================================

    /**
     * GET /api/db/users → 获取所有用户
     *
     * ResponseEntity.ok() 等同于 HTTP 200 OK
     * ApiResponse.ok(data) 包装成统一格式：{ success: true, data: [...], message: "操作成功" }
     */
    @GetMapping("/db/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllUsers()));
    }

    /**
     * GET /api/db/users/detail?id=1 → 按 ID 查询单个用户
     *
     * @RequestParam Long id → 从 URL 的 ?id=1 中提取参数
     *
     * Optional 的链式处理：
     *   .map(user -> ...)    → 用户存在时执行（返回 200）
     *   .orElse(...)         → 用户不存在时执行（返回 404）
     *
     * 类比前端：
     *   user ? res.json(user) : res.status(404).json({ error: "not found" })
     */
    @GetMapping("/db/users/detail")
    public ResponseEntity<ApiResponse<User>> getUserById(@RequestParam Long id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(ApiResponse.ok(user)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.fail("用户不存在，ID: " + id)));
    }

    /**
     * GET /api/db/users/by-city?city=Beijing → 按城市查询
     *
     * @RequestParam String city → 从 ?city=Beijing 提取
     */
    @GetMapping("/db/users/by-city")
    public ResponseEntity<ApiResponse<List<User>>> getUsersByCity(@RequestParam String city) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUsersByCity(city)));
    }

    /**
     * GET /api/db/users/search?email=xxx → 按邮箱模糊搜索
     */
    @GetMapping("/db/users/search")
    public ResponseEntity<ApiResponse<List<User>>> searchUsers(@RequestParam String email) {
        return ResponseEntity.ok(ApiResponse.ok(userService.searchUsersByEmail(email)));
    }

    /** GET /api/db/count → 用户总数 */
    @GetMapping("/db/count")
    public ResponseEntity<ApiResponse<Long>> getUserCount() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserCount()));
    }

    /** GET /api/db/cities → 所有城市列表（去重） */
    @GetMapping("/db/cities")
    public ResponseEntity<ApiResponse<List<String>>> getAllCities() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllCities()));
    }

    /** GET /api/db/companies → 所有公司列表（去重） */
    @GetMapping("/db/companies")
    public ResponseEntity<ApiResponse<List<String>>> getAllCompanies() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllCompanies()));
    }

    /** GET /api/db/stats → 统计信息（总数、城市列表、公司列表） */
    @GetMapping("/db/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getStats()));
    }

    // ============================================
    // 增删改接口
    // ============================================

    /**
     * POST /api/db/users → 新增用户
     *
     * @RequestBody User user → 从请求体 JSON 自动反序列化为 User 对象
     *   类比前端：req.body（Express）或 await req.json()（Fetch API）
     *
     * 返回 201 Created（而不是 200 OK）：
     * - 201 是 HTTP 标准，表示"资源已创建"
     * - 200 表示"请求成功"，语义上 201 更准确
     */
    @PostMapping("/db/users")
    public ResponseEntity<ApiResponse<User>> createUser(@RequestBody User user) {
        user.setId(userService.getNextId());  // 自动分配 ID
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(userService.saveUser(user), "创建成功"));
    }

    /**
     * PUT /api/db/users/update?id=1 → 更新用户
     *
     * 为什么 PUT 也用 Query Param 传 ID？
     * 项目规范：所有接口统一用 Query Params，不用 Path Params（/users/1）
     *
     * 先检查用户是否存在，不存在返回 404
     * 存在则用请求体数据覆盖，保持 ID 不变
     */
    @PutMapping("/db/users/update")
    public ResponseEntity<ApiResponse<User>> updateUser(@RequestParam Long id, @RequestBody User user) {
        if (userService.getUserById(id).isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail("用户不存在，ID: " + id));
        }
        user.setId(id);  // 确保 ID 不被请求体覆盖
        return ResponseEntity.ok(ApiResponse.ok(userService.saveUser(user), "更新成功"));
    }

    /**
     * DELETE /api/db/users/delete?id=1 → 删除用户
     *
     * ApiResponse<Void>：Void 表示 data 字段为 null（删除操作不需要返回数据）
     * 类比 TypeScript：ApiResponse<void>
     */
    @DeleteMapping("/db/users/delete")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@RequestParam Long id) {
        if (userService.getUserById(id).isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail("用户不存在，ID: " + id));
        }
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "删除成功"));
    }

    // ============================================
    // 批量操作接口
    // ============================================

    /**
     * POST /api/users/batch → 批量保存用户
     *
     * 接收 JSON 数组：[{ id, name, city, ... }, ...]
     * 兼容前端格式和 JSONPlaceholder 格式
     */
    @PostMapping("/users/batch")
    public ResponseEntity<ApiResponse<Map<String, Object>>> batchSaveUsers(
            @RequestBody List<Map<String, Object>> users) {
        if (users == null || users.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("请求数据为空"));
        }
        Map<String, Object> result = userService.batchSaveUsers(users);
        return ResponseEntity.ok(ApiResponse.ok(result, result.get("message").toString()));
    }

    /**
     * POST /api/db/fetch-users → 从 JSONPlaceholder 获取并保存所有用户
     *
     * 这个接口会调用外部 API，可能需要几秒钟
     * 适合用于初始化测试数据
     */
    @PostMapping("/db/fetch-users")
    public ResponseEntity<ApiResponse<List<User>>> fetchAndSaveUsers() {
        List<User> users = userService.fetchAndSaveAllUsers();
        return ResponseEntity.ok(ApiResponse.ok(users,
                "成功获取并保存 " + users.size() + " 个用户"));
    }
}
