---
outline: deep
---

# 监控与日志：概念与实践

> 本章介绍生产环境中常用的监控（Prometheus + Grafana）和日志（ELK/EFK）方案。这些工具在企业级项目中广泛使用，了解其原理对全栈工程师非常有价值。
>
> 注意：本项目部署在 Render 免费版 + GitHub Pages 上，不适合运行这些重量级服务。本章以概念讲解和架构设计为主，帮助你理解「为什么需要」和「怎么设计」。

## 为什么需要监控和日志？

当应用部署到生产环境后，你需要回答这些问题：

| 问题 | 需要的工具 |
|------|-----------|
| 服务还活着吗？ | 健康检查 + 告警 |
| API 响应慢不慢？ | 性能监控（Prometheus） |
| 哪个接口调用最多？ | 指标采集（Prometheus） |
| 用户遇到了什么错误？ | 日志收集（ELK/EFK） |
| 服务器资源够用吗？ | 资源监控（Grafana 仪表盘） |

```
没有监控 = 盲人开车
没有日志 = 出了事故没有行车记录仪
```

## 监控方案：Prometheus + Grafana

### 架构概览

```
Spring Boot 应用
    │
    │ /actuator/prometheus（暴露指标）
    ▼
Prometheus（定时拉取指标、存储时序数据）
    │
    │ PromQL 查询
    ▼
Grafana（可视化仪表盘、告警规则）
    │
    ▼
告警通知（邮件、Slack、钉钉）
```

### Prometheus 是什么？

Prometheus 是一个开源的监控系统，核心功能是采集和存储时序数据（随时间变化的指标）。

| 特性 | 说明 | 前端类比 |
|------|------|---------|
| Pull 模式 | 主动拉取应用暴露的指标 | 类似轮询 API |
| 时序数据库 | 按时间存储指标数据 | 类似 `localStorage` 但带时间戳 |
| PromQL | 查询语言 | 类似 SQL 但专门查时序数据 |
| 告警规则 | 指标超阈值时触发告警 | 类似 `if (value > threshold) notify()` |

### Spring Boot 集成 Prometheus

Spring Boot 通过 Actuator + Micrometer 暴露 Prometheus 格式的指标：

```xml
<!-- pom.xml 添加依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

```properties
# application.properties
# 暴露 Prometheus 指标端点
management.endpoints.web.exposure.include=health,prometheus,metrics
# 启用 Prometheus 端点
management.endpoint.prometheus.enabled=true
```

配置后访问 `/actuator/prometheus` 会返回类似这样的指标数据：

```
# 应用启动时间
process_uptime_seconds 3600.0
# HTTP 请求计数（按路径、方法、状态码分组）
http_server_requests_seconds_count{method="GET",uri="/api/posts",status="200"} 1234
# HTTP 请求耗时
http_server_requests_seconds_sum{method="GET",uri="/api/posts",status="200"} 45.6
# JVM 内存使用
jvm_memory_used_bytes{area="heap"} 134217728
```

### Grafana 是什么？

Grafana 是一个可视化平台，可以将 Prometheus 的数据绘制成图表和仪表盘：

| 功能 | 说明 |
|------|------|
| 仪表盘 | 将指标数据可视化为图表、表格、仪表盘 |
| 数据源 | 支持 Prometheus、MySQL、Elasticsearch 等多种数据源 |
| 告警 | 基于指标设置告警规则，支持多种通知渠道 |
| 模板 | 社区提供大量现成的仪表盘模板，导入即用 |

### 常用监控指标

| 指标类型 | 示例 | 告警阈值建议 |
|----------|------|-------------|
| 请求速率 | 每秒请求数（QPS） | QPS 突增 200% |
| 响应时间 | P99 延迟 | P99 > 2s |
| 错误率 | 5xx 错误占比 | 错误率 > 1% |
| JVM 内存 | 堆内存使用率 | 使用率 > 80% |
| 数据库连接 | 活跃连接数 | 连接数 > 池大小 80% |

### Docker Compose 示例（学习用）

以下配置仅供学习参考，展示如何在本地搭建完整的监控栈：

```yaml
# docker-compose.monitoring.yml（学习用，不包含在项目中）
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    depends_on:
      - prometheus
```

```yaml
# prometheus.yml（Prometheus 配置）
global:
  scrape_interval: 15s          # 每 15 秒拉取一次指标

scrape_configs:
  - job_name: 'spring-boot'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['backend:8080']  # 后端服务地址
```

## 日志方案：ELK / EFK

### ELK 是什么？

ELK 是三个开源工具的组合，用于日志的收集、存储和可视化：

| 组件 | 全称 | 作用 | 类比 |
|------|------|------|------|
| E | Elasticsearch | 日志存储和搜索引擎 | 类似数据库，但专门做全文搜索 |
| L | Logstash | 日志收集和处理 | 类似 ETL 管道，清洗和转换数据 |
| K | Kibana | 日志可视化和查询 | 类似 Grafana，但专门看日志 |

EFK 是 ELK 的变体，用 Fluentd 替代 Logstash（更轻量）：

| 对比 | Logstash | Fluentd |
|------|----------|---------|
| 语言 | Java（JRuby） | Ruby + C |
| 内存占用 | ~500MB | ~40MB |
| 配置方式 | 自定义 DSL | 标签路由 |
| 适用场景 | 复杂日志处理 | 轻量级日志收集 |

### 日志架构

```
Spring Boot 应用 → 输出日志到 stdout
    │
    ▼
Fluentd / Logstash（收集、解析、转发日志）
    │
    ▼
Elasticsearch（存储日志，建立索引）
    │
    ▼
Kibana（搜索、可视化、分析日志）
```

### Spring Boot 日志配置

Spring Boot 默认使用 Logback，可以输出结构化 JSON 日志便于 ELK 解析：

```xml
<!-- logback-spring.xml（生产环境日志配置示例） -->
<configuration>
  <springProfile name="prod">
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
      <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
    </appender>
    <root level="WARN">
      <appender-ref ref="STDOUT"/>
    </root>
  </springProfile>
</configuration>
```

输出的 JSON 日志格式：

```json
{
  "@timestamp": "2025-01-15T10:30:00.000Z",
  "level": "ERROR",
  "logger_name": "com.example.fetchdemo.controller.AuthController",
  "message": "Login failed for user: admin",
  "stack_trace": "..."
}
```

### 常用日志查询场景

| 场景 | Kibana 查询示例 |
|------|----------------|
| 查找错误日志 | `level: ERROR` |
| 查找特定用户操作 | `message: "user123"` |
| 查找慢请求 | `response_time: >2000` |
| 查找特定时间段 | 时间范围选择器 |
| 查找特定接口 | `logger_name: *AuthController*` |

## 适合个人项目的轻量方案

对于部署在 Render 免费版的个人项目，完整的 Prometheus + Grafana + ELK 太重了。以下是一些轻量替代方案：

| 需求 | 轻量方案 | 说明 |
|------|---------|------|
| 服务存活监控 | [UptimeRobot](https://uptimerobot.com/) | 免费监控 50 个 URL，支持邮件告警 |
| 应用日志 | Render Dashboard 内置日志 | 免费版保留最近日志 |
| 错误追踪 | [Sentry](https://sentry.io/) | 免费版支持 5K 事件/月 |
| 性能监控 | Spring Boot Actuator `/health` | 内置健康检查端点 |
| 前端监控 | [Vercel Analytics](https://vercel.com/analytics) | Vercel 内置的 Web Vitals 监控 |

::: tip 学习建议
1. 先理解概念和架构设计
2. 在本地用 Docker Compose 搭建 Prometheus + Grafana 体验一下
3. 实际项目中根据规模选择合适的方案
4. 个人项目用 UptimeRobot + Sentry 就够了
:::
