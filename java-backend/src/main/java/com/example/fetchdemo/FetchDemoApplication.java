package com.example.fetchdemo;

// Spring Boot 核心注解导入
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot 应用程序入口类
 * 
 * @SpringBootApplication 是一个组合注解，包含：
 * - @Configuration: 标记这是一个配置类
 * - @EnableAutoConfiguration: 启用 Spring Boot 自动配置
 * - @ComponentScan: 自动扫描当前包及子包下的组件
 * 
 * 类比前端：这就像 React 的 main.tsx，是整个应用的启动入口
 */
@SpringBootApplication
public class FetchDemoApplication {

    /**
     * 应用程序主入口方法
     * 
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        // SpringApplication.run() 启动 Spring Boot 应用
        // 它会：
        // 1. 创建 Spring 容器
        // 2. 启动内嵌的 Tomcat 服务器
        // 3. 扫描并注册所有组件
        SpringApplication.run(FetchDemoApplication.class, args);
        
        System.out.println("🚀 服务已启动！访问 http://localhost:8080");
    }
}
