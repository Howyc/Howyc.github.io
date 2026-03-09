package com.example.fetchdemo.config;

import java.io.IOException;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * CORS 跨域配置
 *
 * =====================================================
 * 什么是 CORS（跨域资源共享）？
 * =====================================================
 * 浏览器有一个安全策略叫"同源策略"：
 * 默认情况下，网页只能请求和自己"同源"（协议+域名+端口相同）的服务器。
 *
 * 我们的情况：
 *   前端：http://localhost:5173  （Vite 开发服务器）
 *   后端：http://localhost:8080  （Spring Boot）
 *
 * 端口不同（5173 ≠ 8080），所以浏览器会拦截前端对后端的请求！
 * 这就是"跨域"问题。
 *
 * 解决方案：后端在响应头里加上 "Access-Control-Allow-Origin"，
 * 告诉浏览器："我允许这个来源访问我"。
 *
 * =====================================================
 * 为什么用 Filter 而不是 @CrossOrigin？
 * =====================================================
 * Spring 有多种配置 CORS 的方式：
 *
 * 方式1：@CrossOrigin(origins = "*")  加在 Controller 上
 *   - 简单，但 allowCredentials=true 时不能用 "*"
 *
 * 方式2：WebMvcConfigurer（配置类）
 *   - 全局配置，但有时会被 Spring Security 覆盖
 *
 * 方式3：Filter（过滤器）← 我们用这种
 *   - 最底层，优先级最高，不会被其他配置覆盖
 *   - 适合需要动态处理 Origin 的场景
 *
 * =====================================================
 * 什么是 Filter（过滤器）？
 * =====================================================
 * Filter 是 Java Web 的概念，类似于前端的"中间件"或"拦截器"。
 * 每个 HTTP 请求在到达 Controller 之前，都会先经过所有 Filter。
 *
 * 类比前端：
 *   就像 axios 的请求拦截器（interceptors.request）
 *   或者 Express.js 的 app.use(middleware)
 *
 * 请求流程：
 *   浏览器请求 → Filter（加 CORS 头）→ Controller → 返回响应
 *
 * =====================================================
 * 注解说明
 * =====================================================
 * @Component    → 注册为 Spring 组件，Spring 会自动发现并使用它
 * @Order(Ordered.HIGHEST_PRECEDENCE) → 设置最高优先级，确保最先执行
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsConfig implements Filter {

    /**
     * 过滤器核心方法，每个请求都会经过这里
     *
     * @param req   原始请求对象
     * @param res   原始响应对象
     * @param chain 过滤器链（调用 chain.doFilter 继续传递请求）
     */
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        // 转换为 HTTP 类型，才能操作 HTTP 特有的头信息
        HttpServletResponse response = (HttpServletResponse) res;
        HttpServletRequest request = (HttpServletRequest) req;

        // 获取请求来源（前端的地址，如 http://localhost:5173）
        String origin = request.getHeader("Origin");

        // 动态设置允许的来源
        // 为什么不直接用 "*"？
        // 因为当 allowCredentials=true（允许携带 Cookie）时，
        // 浏览器要求 Access-Control-Allow-Origin 必须是具体的域名，不能是 "*"
        if (origin != null) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        }

        // 允许的 HTTP 方法
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");

        // 允许的请求头
        response.setHeader("Access-Control-Allow-Headers",
                "Content-Type, Authorization, X-Requested-With, Accept, Origin");

        // 允许携带 Cookie 和认证信息
        response.setHeader("Access-Control-Allow-Credentials", "true");

        // 预检请求的缓存时间（秒）
        // 浏览器会缓存这个结果，3600 秒内不再发送预检请求
        response.setHeader("Access-Control-Max-Age", "3600");

        // =====================================================
        // 处理 OPTIONS 预检请求（Preflight Request）
        // =====================================================
        // 什么是预检请求？
        // 浏览器在发送"复杂请求"（如 POST with JSON）之前，
        // 会先发一个 OPTIONS 请求，询问服务器："我可以这样请求你吗？"
        // 服务器回答"可以"后，浏览器才发真正的请求。
        //
        // 这里直接返回 200，告诉浏览器"可以"，不需要继续处理
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;  // 直接返回，不继续传递给 Controller
        }

        // 继续传递请求给下一个 Filter 或 Controller
        // 类比前端：next() 或 next(req, res)
        chain.doFilter(req, res);
    }
}
