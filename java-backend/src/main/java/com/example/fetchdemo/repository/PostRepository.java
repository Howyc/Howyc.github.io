package com.example.fetchdemo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.fetchdemo.entity.Post;

/**
 * 帖子数据访问接口 (Repository)
 *
 * =====================================================
 * 什么是 Repository？
 * =====================================================
 * Repository 是"数据访问层"，专门负责和数据库打交道。
 * 你可以把它理解为：数据库操作的工具箱。
 *
 * 类比前端：
 *   Repository  ←→  api.ts 里的函数（但操作的是数据库，不是 HTTP）
 *   findAll()   ←→  fetchDatabasePosts()
 *   findById()  ←→  getPostById()
 *   save()      ←→  createPost() / updatePost()
 *   deleteById()←→  deletePost()
 *
 * =====================================================
 * Spring Data JPA 的"魔法"
 * =====================================================
 * 你只需要定义接口（interface），不需要写任何实现代码！
 * Spring 会在程序启动时，自动生成实现类。
 *
 * 这就像你在 Prisma 里定义 schema，然后自动获得：
 *   prisma.post.findMany()
 *   prisma.post.findUnique()
 *   prisma.post.create()
 *   prisma.post.delete()
 *
 * =====================================================
 * JpaRepository<Post, Long> 的含义
 * =====================================================
 * - Post：这个 Repository 操作的实体类型
 * - Long：主键（ID）的类型
 *
 * 继承 JpaRepository 后，自动获得这些方法（无需自己写）：
 *   save(post)           → 保存或更新（有 ID 就更新，没有就新增）
 *   findById(id)         → 按 ID 查询，返回 Optional<Post>
 *   findAll()            → 查询所有帖子
 *   deleteById(id)       → 按 ID 删除
 *   existsById(id)       → 判断 ID 是否存在，返回 boolean
 *   count()              → 统计总数量
 *
 * @Repository → 标记这是数据访问组件，Spring 会自动管理它
 */
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    /**
     * 按用户 ID 查询该用户的所有帖子
     *
     * =====================================================
     * Spring Data JPA 方法命名规则（重要！）
     * =====================================================
     * Spring 会根据方法名自动生成 SQL，规则如下：
     *
     *   findBy + 字段名  →  WHERE 字段 = ?
     *
     * 所以 findByUserId(userId) 会自动生成：
     *   SELECT * FROM posts WHERE user_id = ?
     *
     * 更多例子：
     *   findByTitle(title)              → WHERE title = ?
     *   findByUserIdAndTitle(id, title) → WHERE user_id = ? AND title = ?
     *   findByUserIdOrderByIdDesc(id)   → WHERE user_id = ? ORDER BY id DESC
     *
     * @param userId 用户 ID
     * @return 该用户的所有帖子列表
     */
    List<Post> findByUserId(Long userId);

    /**
     * 按标题关键字模糊搜索（不区分大小写）
     *
     * 方法名解析：
     *   findBy          → 查询操作
     *   Title           → 按 title 字段
     *   Containing      → 包含（模糊匹配，等同于 SQL 的 LIKE '%keyword%'）
     *   IgnoreCase      → 不区分大小写
     *
     * 自动生成的 SQL：
     *   SELECT * FROM posts WHERE LOWER(title) LIKE LOWER('%keyword%')
     *
     * 类比前端：
     *   posts.filter(p => p.title.toLowerCase().includes(keyword.toLowerCase()))
     *
     * @param title 标题关键字
     * @return 标题包含该关键字的帖子列表
     */
    List<Post> findByTitleContainingIgnoreCase(String title);
}
