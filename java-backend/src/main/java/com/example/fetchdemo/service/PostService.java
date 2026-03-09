package com.example.fetchdemo.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.fetchdemo.entity.Post;
import com.example.fetchdemo.repository.PostRepository;

/**
 * 帖子业务逻辑服务类
 *
 * =====================================================
 * 三层架构中的 Service 层
 * =====================================================
 * HTTP 请求 → PostController → PostService（这里）→ PostRepository → Database
 *
 * 和 UserService 结构完全一致，可以对比学习：
 * - 构造函数注入依赖
 * - Logger 记录日志
 * - @Transactional 保证批量操作的原子性
 * - 批量操作用 saveAll() 优化性能
 *
 * @Service → Spring 自动管理这个类的生命周期（单例模式）
 */
@Service
public class PostService {

    /**
     * 日志记录器（同 UserService，参考那里的详细说明）
     */
    private static final Logger log = LoggerFactory.getLogger(PostService.class);

    /**
     * 帖子数据访问对象（构造函数注入）
     */
    private final PostRepository postRepository;

    /**
     * 构造函数注入
     * Spring 启动时自动调用，注入 PostRepository 实例
     */
    @Autowired
    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    // ============================================
    // 查询方法
    // ============================================

    /**
     * 获取所有帖子
     * @return 所有帖子列表
     */
    public List<Post> findAll() {
        return postRepository.findAll();
    }

    /**
     * 按 ID 查询帖子
     *
     * 返回 Optional<Post>，强制调用方处理"不存在"的情况
     * Controller 层用 .map(...).orElse(...) 处理两种情况
     *
     * @param id 帖子 ID
     * @return Optional 包装的帖子
     */
    public Optional<Post> findById(Long id) {
        return postRepository.findById(id);
    }

    /**
     * 按用户 ID 查询该用户的所有帖子
     *
     * @param userId 用户 ID
     * @return 该用户的帖子列表
     */
    public List<Post> findByUserId(Long userId) {
        return postRepository.findByUserId(userId);
    }

    /**
     * 按标题关键字模糊搜索（不区分大小写）
     *
     * @param title 标题关键字
     * @return 匹配的帖子列表
     */
    public List<Post> searchByTitle(String title) {
        return postRepository.findByTitleContainingIgnoreCase(title);
    }

    /**
     * 获取帖子总数
     * @return 数据库中的帖子数量
     */
    public long count() {
        return postRepository.count();
    }

    // ============================================
    // 增删改方法
    // ============================================

    /**
     * 保存（新增或更新）帖子
     *
     * JPA save() 行为：
     * - post.id 不存在 → INSERT
     * - post.id 已存在 → UPDATE
     *
     * @param post 要保存的帖子
     * @return 保存后的帖子
     */
    public Post save(Post post) {
        return postRepository.save(post);
    }

    /**
     * 按 ID 删除帖子
     * @param id 要删除的帖子 ID
     */
    public void deleteById(Long id) {
        postRepository.deleteById(id);
    }

    // ============================================
    // 批量保存（性能优化版）
    // ============================================

    /**
     * 批量保存帖子数据
     *
     * =====================================================
     * 实现思路（和 UserService.batchSaveUsers 一致）
     * =====================================================
     * 1. 提前查出所有已存在的 ID → 用于区分"新增"还是"更新"
     * 2. 将 Map 数据转换为 Post 实体
     * 3. 用 saveAll() 批量保存（只有 1 次数据库写操作）
     *
     * @Transactional：保证原子性，失败时全部回滚
     *
     * @param postsData 帖子数据列表（Map 格式）
     * @return 包含 savedCount、updatedCount、failedCount 的结果 Map
     */
    @Transactional
    public Map<String, Object> batchSave(List<Map<String, Object>> postsData) {
        if (postsData == null || postsData.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("savedCount", 0);
            result.put("updatedCount", 0);
            result.put("failedCount", 0);
            result.put("message", "没有数据需要保存");
            return result;
        }

        log.info("批量保存帖子，数量: {}", postsData.size());

        List<Post> toSave = new ArrayList<>();
        int failedCount = 0;

        // 步骤 1：一次性查出所有已存在的 ID
        List<Long> incomingIds = postsData.stream()
                .map(d -> toLong(d.get("id")))
                .filter(id -> id != null)
                .collect(Collectors.toList());

        Set<Long> existingIds = postRepository.findAllById(incomingIds)
                .stream()
                .map(Post::getId)
                .collect(Collectors.toSet());

        // 步骤 2：转换 Map → Post 实体
        for (Map<String, Object> data : postsData) {
            try {
                Long id = toLong(data.get("id"));
                if (id == null) { failedCount++; continue; }  // ID 缺失，跳过

                Post post = new Post();
                post.setId(id);
                post.setUserId(toLong(data.get("userId")));
                // 用三元运算符避免 NullPointerException
                post.setTitle(data.get("title") != null ? data.get("title").toString() : "");
                post.setBody(data.get("body") != null ? data.get("body").toString() : "");
                toSave.add(post);
            } catch (Exception e) {
                log.warn("转换帖子数据失败: {}", e.getMessage());
                failedCount++;
            }
        }

        // 步骤 3：批量保存
        List<Post> saved = postRepository.saveAll(toSave);

        // 统计新增 vs 更新
        int updatedCount = (int) saved.stream().filter(p -> existingIds.contains(p.getId())).count();
        int savedCount = saved.size() - updatedCount;

        log.info("批量保存完成: 新增={}, 更新={}, 失败={}", savedCount, updatedCount, failedCount);

        Map<String, Object> result = new HashMap<>();
        result.put("success", failedCount == 0);
        result.put("savedCount", savedCount);
        result.put("updatedCount", updatedCount);
        result.put("failedCount", failedCount);
        result.put("message", String.format("新增 %d 条，更新 %d 条", savedCount, updatedCount));
        return result;
    }

    // ============================================
    // 私有辅助方法
    // ============================================

    /**
     * 将任意类型转换为 Long
     *
     * 处理两种情况：
     * - Number（JSON 数字）：直接 .longValue()
     * - String（字符串数字）：用 Long.parseLong 转换
     *
     * 使用 instanceof 模式匹配（Java 16+ 特性），比旧写法更简洁：
     * 旧：if (obj instanceof Number) { return ((Number) obj).longValue(); }
     * 新：if (obj instanceof Number n) { return n.longValue(); }
     *
     * @param obj 原始值
     * @return Long 类型，无法转换时返回 null
     */
    private Long toLong(Object obj) {
        if (obj instanceof Number n) return n.longValue();
        if (obj instanceof String s) {
            try { return Long.parseLong(s); } catch (NumberFormatException ignored) {}
        }
        return null;
    }
}
