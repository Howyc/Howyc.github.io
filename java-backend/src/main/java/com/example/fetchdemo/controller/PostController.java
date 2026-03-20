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
import com.example.fetchdemo.entity.Post;
import com.example.fetchdemo.service.PostService;

import jakarta.validation.Valid;

/**
 * 帖子 CRUD 控制器
 *
 * =====================================================
 * 和 DatabaseController（用户控制器）结构完全一致
 * 对比学习两个 Controller，可以掌握 Spring MVC 的规律
 * =====================================================
 *
 * 接口路由总览：
 * GET    /api/db/posts              → 获取所有帖子
 * GET    /api/db/posts/detail?id=1  → 按 ID 查询
 * GET    /api/db/posts/by-user?userId=1 → 按用户 ID 查询
 * GET    /api/db/posts/search?title=xxx → 标题搜索
 * GET    /api/db/posts/count        → 帖子总数
 * POST   /api/db/posts              → 新增帖子
 * PUT    /api/db/posts/update?id=1  → 更新帖子
 * DELETE /api/db/posts/delete?id=1  → 删除帖子
 * POST   /api/posts/batch           → 批量保存
 */
@RestController
@RequestMapping("/api")
public class PostController {

    private final PostService postService;

    @Autowired
    public PostController(PostService postService) {
        this.postService = postService;
    }

    // ============================================
    // 查询接口
    // ============================================

    /**
     * GET /api/db/posts → 获取所有帖子
     * 注意：数据量大时应考虑分页（Pageable），这里为简单起见返回全部
     */
    @GetMapping("/db/posts")
    public ResponseEntity<ApiResponse<List<Post>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(postService.findAll()));
    }

    /**
     * GET /api/db/posts/detail?id=1 → 按 ID 查询单个帖子
     *
     * Optional 链式处理：
     *   .map(post -> 200 OK)
     *   .orElse(404 Not Found)
     */
    @GetMapping("/db/posts/detail")
    public ResponseEntity<ApiResponse<Post>> getById(@RequestParam Long id) {
        return postService.findById(id)
                .map(post -> ResponseEntity.ok(ApiResponse.ok(post)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.fail("帖子不存在，ID: " + id)));
    }

    /**
     * GET /api/db/posts/by-user?userId=1 → 查询某用户的所有帖子
     */
    @GetMapping("/db/posts/by-user")
    public ResponseEntity<ApiResponse<List<Post>>> getByUserId(@RequestParam Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(postService.findByUserId(userId)));
    }

    /**
     * GET /api/db/posts/search?title=xxx → 按标题关键字搜索（不区分大小写）
     */
    @GetMapping("/db/posts/search")
    public ResponseEntity<ApiResponse<List<Post>>> searchByTitle(@RequestParam String title) {
        return ResponseEntity.ok(ApiResponse.ok(postService.searchByTitle(title)));
    }

    /** GET /api/db/posts/count → 帖子总数 */
    @GetMapping("/db/posts/count")
    public ResponseEntity<ApiResponse<Long>> count() {
        return ResponseEntity.ok(ApiResponse.ok(postService.count()));
    }

    // ============================================
    // 增删改接口
    // ============================================

    /**
     * POST /api/db/posts → 新增帖子
     *
     * 请求体示例：
     * {
     *   "userId": 1,
     *   "title": "帖子标题",
     *   "body": "帖子内容"
     * }
     *
     * 返回 201 Created（HTTP 标准：资源创建成功）
     */
    @PostMapping("/db/posts")
    public ResponseEntity<ApiResponse<Post>> create(@Valid @RequestBody Post post) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(postService.save(post), "创建成功"));
    }

    /**
     * PUT /api/db/posts/update?id=1 → 更新帖子
     *
     * 先检查帖子是否存在，不存在返回 404
     * 用 post.setId(id) 确保 ID 来自 URL 参数，防止请求体篡改 ID
     */
    @PutMapping("/db/posts/update")
    public ResponseEntity<ApiResponse<Post>> update(@RequestParam Long id, @Valid @RequestBody Post post) {
        if (postService.findById(id).isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail("帖子不存在，ID: " + id));
        }
        post.setId(id);
        return ResponseEntity.ok(ApiResponse.ok(postService.save(post), "更新成功"));
    }

    /**
     * DELETE /api/db/posts/delete?id=1 → 删除帖子
     *
     * ApiResponse<Void>：删除操作不需要返回数据，data 为 null
     */
    @DeleteMapping("/db/posts/delete")
    public ResponseEntity<ApiResponse<Void>> delete(@RequestParam Long id) {
        if (postService.findById(id).isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail("帖子不存在，ID: " + id));
        }
        postService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "删除成功"));
    }

    // ============================================
    // 批量操作接口
    // ============================================

    /**
     * POST /api/posts/batch → 批量保存帖子
     *
     * 请求体示例（JSONPlaceholder 格式）：
     * [
     *   { "id": 1, "userId": 1, "title": "...", "body": "..." },
     *   { "id": 2, "userId": 1, "title": "...", "body": "..." }
     * ]
     */
    @PostMapping("/posts/batch")
    public ResponseEntity<ApiResponse<Map<String, Object>>> batchSave(
            @RequestBody List<Map<String, Object>> posts) {
        if (posts == null || posts.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("请求数据为空"));
        }
        Map<String, Object> result = postService.batchSave(posts);
        return ResponseEntity.ok(ApiResponse.ok(result, result.get("message").toString()));
    }
}
