package com.example.fetchdemo.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

/**
 * 外部 API 代理控制器
 *
 * =====================================================
 * 什么是 Controller（控制器）？
 * =====================================================
 * Controller 是"请求处理层"，负责：
 * 1. 接收 HTTP 请求（GET/POST/PUT/DELETE）
 * 2. 解析请求参数
 * 3. 调用 Service 处理业务逻辑
 * 4. 返回 HTTP 响应（通常是 JSON）
 *
 * 类比前端：
 *   就像 Next.js 的 API Routes（app/api/xxx/route.ts）
 *   或者 Express.js 的路由：app.get('/api/xxx', (req, res) => {...})
 *
 * =====================================================
 * 注解说明
 * =====================================================
 * @RestController
 *   = @Controller + @ResponseBody 的组合
 *   - @Controller：标记这是一个控制器
 *   - @ResponseBody：方法返回值自动转为 JSON 响应体
 *   所以你直接 return 一个 Map 或对象，Spring 会自动转成 JSON
 *
 * @RequestMapping("/api")
 *   所有这个 Controller 里的接口，URL 都以 /api 开头
 *   类比前端：就像路由的 prefix
 *
 * @CrossOrigin(origins = "*")
 *   允许所有来源的跨域请求（这里是备用，主要靠 CorsConfig.java）
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class FetchController {

    /**
     * RestTemplate：Spring 提供的 HTTP 客户端工具
     *
     * 用于在后端调用其他 HTTP 接口（外部 API）
     *
     * 类比前端：
     *   RestTemplate  ←→  fetch() 或 axios
     *   getForObject()←→  fetch(url).then(res => res.json())
     *
     * 注意：在生产项目中，更推荐使用 WebClient（异步非阻塞）
     * RestTemplate 是同步阻塞的，适合学习和简单场景
     */
    private final RestTemplate restTemplate = new RestTemplate();

    // =====================================================
    // 接口定义
    // =====================================================

    /**
     * 健康检查接口
     *
     * 访问地址：GET http://localhost:8080/api/health
     *
     * 用途：检查后端服务是否正常运行
     * 类比前端：就像 ping 一下服务器
     *
     * @GetMapping("/health")
     *   处理 GET /api/health 请求
     *   完整路径 = @RequestMapping("/api") + @GetMapping("/health")
     *
     * @return 服务状态信息（自动转为 JSON）
     */
    @GetMapping("/health")
    public Map<String, Object> health() {
        // HashMap 类比前端的对象字面量 {}
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");                              // response.status = "ok"
        response.put("message", "Java 后端服务运行正常！");
        response.put("timestamp", System.currentTimeMillis());     // 当前时间戳（毫秒）
        return response;
        // Spring 自动把这个 Map 转成 JSON：
        // { "status": "ok", "message": "...", "timestamp": 1234567890 }
    }

    /**
     * 获取 GitHub 用户信息（代理接口）
     *
     * 访问地址：GET http://localhost:8080/api/github/users/{username}
     * 示例：    GET http://localhost:8080/api/github/users/octocat
     *
     * 为什么需要后端代理？
     * 前端直接调用 GitHub API 可能遇到 CORS 问题，
     * 通过后端代理，前端只需调用自己的后端，后端再去请求 GitHub。
     *
     * @PathVariable String username
     *   从 URL 路径中提取参数
     *   URL：/api/github/users/octocat → username = "octocat"
     *   类比前端：Next.js 的 params.username 或 Express 的 req.params.username
     *
     * @param username GitHub 用户名
     * @return GitHub 用户信息（JSON 格式）
     */
    @GetMapping("/github/users/{username}")
    public Object getGitHubUser(@PathVariable String username) {
        String url = "https://api.github.com/users/" + username;

        try {
            // getForObject(url, 返回类型)
            // Object.class 表示返回任意类型（Spring 会自动处理）
            return restTemplate.getForObject(url, Object.class);
        } catch (Exception e) {
            // 请求失败时返回错误信息
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", "获取用户信息失败: " + e.getMessage());
            return error;
        }
    }

    /**
     * 通用 URL 代理接口
     *
     * 访问地址：GET http://localhost:8080/api/fetch?url=xxx
     * 示例：    GET http://localhost:8080/api/fetch?url=https://jsonplaceholder.typicode.com/users/1
     *
     * @RequestParam String url
     *   从查询参数（Query String）中获取值
     *   URL：/api/fetch?url=https://...  → url = "https://..."
     *   类比前端：new URLSearchParams(location.search).get('url')
     *   或者 Express 的 req.query.url
     *
     * @param url 要代理请求的目标 URL
     * @return 目标 URL 返回的数据
     */
    @GetMapping("/fetch")
    public Object fetchUrl(@RequestParam String url) {
        try {
            return restTemplate.getForObject(url, Object.class);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", "获取失败: " + e.getMessage());
            error.put("url", url);
            return error;
        }
    }

    /**
     * 获取 JSONPlaceholder 测试用户列表
     *
     * 访问地址：GET http://localhost:8080/api/test/users
     *
     * JSONPlaceholder 是一个免费的假数据 API，常用于学习和测试
     * 网址：https://jsonplaceholder.typicode.com
     *
     * @return 10 个测试用户的列表
     */
    @GetMapping("/test/users")
    public Object getTestUsers() {
        String url = "https://jsonplaceholder.typicode.com/users";
        return restTemplate.getForObject(url, Object.class);
    }

    /**
     * 获取单个测试用户
     *
     * 访问地址：GET http://localhost:8080/api/test/users/{id}
     * 示例：    GET http://localhost:8080/api/test/users/1
     *
     * @param id 用户 ID（1-10）
     * @return 用户信息
     */
    @GetMapping("/test/users/{id}")
    public Object getTestUser(@PathVariable int id) {
        String url = "https://jsonplaceholder.typicode.com/users/" + id;
        return restTemplate.getForObject(url, Object.class);
    }
}
