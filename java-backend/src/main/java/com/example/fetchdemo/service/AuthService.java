package com.example.fetchdemo.service;

import com.example.fetchdemo.entity.AppUser;
import com.example.fetchdemo.repository.AppUserRepository;
import com.example.fetchdemo.util.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

    public AuthService(AppUserRepository appUserRepository, JwtUtil jwtUtil) {
        this.appUserRepository = appUserRepository;
        this.jwtUtil = jwtUtil;
    }

    public void register(String username, String password) {
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("用户名和密码不能为空");
        }
        if (appUserRepository.findByUsername(username).isPresent()) {
            throw new UsernameExistsException("用户名已存在");
        }
        AppUser user = new AppUser();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        appUserRepository.save(user);
    }

    public String login(String username, String password) {
        AppUser user = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("该账号未注册，请先注册"));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BadCredentialsException("密码错误，请重试");
        }
        return jwtUtil.generateToken(username);
    }

    public static class UsernameExistsException extends RuntimeException {
        public UsernameExistsException(String message) { super(message); }
    }

    public static class BadCredentialsException extends RuntimeException {
        public BadCredentialsException(String message) { super(message); }
    }
}
