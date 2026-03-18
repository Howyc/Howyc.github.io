package com.example.fetchdemo.filter;

import java.io.IOException;
import java.util.List;

import org.springframework.stereotype.Component;

import com.example.fetchdemo.util.JwtUtil;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter implements Filter {

    private final JwtUtil jwtUtil;

    private static final List<String> WHITELIST = List.of(
            "/auth/register",
            "/auth/login",
            "/api/health",
            "/api/posts/",
            "/api/users/batch"
    );

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        String path = httpRequest.getRequestURI();

        if (isWhitelisted(path)) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendJsonError(httpResponse, 401, "缺少认证 token");
            return;
        }

        String token = authHeader.substring(7);
        try {
            jwtUtil.extractUsername(token);
            chain.doFilter(request, response);
        } catch (ExpiredJwtException e) {
            sendJsonError(httpResponse, 401, "token 已过期");
        } catch (JwtException e) {
            sendJsonError(httpResponse, 401, "token 无效");
        }
    }

    private boolean isWhitelisted(String path) {
        return WHITELIST.stream().anyMatch(w -> path.equals(w) || path.startsWith(w));
    }

    private void sendJsonError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(
                String.format("{\"success\":false,\"data\":null,\"message\":\"%s\"}", message)
        );
    }
}
