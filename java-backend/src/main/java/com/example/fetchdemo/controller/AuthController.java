package com.example.fetchdemo.controller;

import com.example.fetchdemo.common.ApiResponse;
import com.example.fetchdemo.service.AuthService;
import com.example.fetchdemo.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        // 输入校验
        if (username == null || username.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.fail("用户名不能为空"));
        if (username.trim().length() < 3)
            return ResponseEntity.badRequest().body(ApiResponse.fail("用户名至少 3 个字符"));
        if (username.trim().length() > 20)
            return ResponseEntity.badRequest().body(ApiResponse.fail("用户名最多 20 个字符"));
        if (password == null || password.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.fail("密码不能为空"));
        if (password.length() < 6)
            return ResponseEntity.badRequest().body(ApiResponse.fail("密码至少 6 个字符"));

        try {
            authService.register(username.trim(), password);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.ok(null, "注册成功"));
        } catch (AuthService.UsernameExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.fail(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, String>>> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        if (username == null || username.isBlank() || password == null || password.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.fail("用户名和密码不能为空"));

        try {
            String token = authService.login(username.trim(), password);
            return ResponseEntity.ok(ApiResponse.ok(Map.of("token", token), "登录成功"));
        } catch (AuthService.BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.fail(e.getMessage()));
        }
    }

    /** 获取当前登录用户信息（需要有效 JWT） */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, String>>> me(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.fail("缺少认证 token"));
        try {
            String username = jwtUtil.extractUsername(authHeader.substring(7));
            return ResponseEntity.ok(ApiResponse.ok(Map.of("username", username), "ok"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.fail("token 无效"));
        }
    }
}
