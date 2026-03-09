package com.example.fetchdemo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * 帖子实体类 (Entity)
 *
 * =====================================================
 * 什么是实体类？
 * =====================================================
 * 实体类是 Java 对象和数据库表之间的"桥梁"。
 * 你在这里定义的每个字段，都会自动变成数据库表的一列。
 *
 * 类比前端 TypeScript：
 *   interface Post {          ←→   @Entity class Post
 *     id: number;             ←→     @Id private Long id;
 *     userId: number;         ←→     private Long userId;
 *     title: string;          ←→     private String title;
 *     body: string;           ←→     private String body;
 *   }
 *
 * 区别：TypeScript 的 interface 只是类型定义，
 *       Java 的 @Entity 会真正在数据库里创建一张表！
 *
 * =====================================================
 * 注解说明
 * =====================================================
 * @Entity     → 告诉 Spring/Hibernate：这个类对应数据库的一张表
 * @Table      → 指定表名，name = "posts" 表示表名叫 posts
 *               如果不写 @Table，默认用类名（Post → post）
 */
@Entity
@Table(name = "posts")
public class Post {

    /**
     * 帖子 ID（主键）
     *
     * @Id → 标记这是主键字段，数据库里会设置为 PRIMARY KEY
     *
     * 注意：这里没有 @GeneratedValue，因为 ID 来自外部 API（JSONPlaceholder）
     * 如果是自己系统生成 ID，通常会加：
     *   @GeneratedValue(strategy = GenerationType.IDENTITY)
     *   这样每次插入数据，数据库会自动 +1
     */
    @Id
    private Long id;

    /**
     * 发帖用户的 ID
     *
     * 这是一个"外键"概念：帖子属于某个用户
     * 类比前端：就像 post.userId 关联到 user.id
     *
     * 注意：这里用的是简单的 Long 字段，而不是 @ManyToOne 关联
     * 更完整的写法是：
     *   @ManyToOne
     *   @JoinColumn(name = "user_id")
     *   private User user;
     * 但为了简单，我们只存 userId 数字
     */
    private Long userId;

    /**
     * 帖子标题
     */
    private String title;

    /**
     * 帖子正文内容
     *
     * @Column(length = 2000) → 指定数据库列的最大长度为 2000 个字符
     * 默认长度是 255，帖子内容可能更长，所以要手动指定
     */
    @Column(length = 2000)
    private String body;

    // =====================================================
    // 构造函数
    // =====================================================

    /**
     * 无参构造函数（必须有！）
     *
     * JPA（Java Persistence API）规范要求：
     * 每个实体类必须有一个 public 或 protected 的无参构造函数
     * 因为 Hibernate 在从数据库读取数据时，会先调用无参构造函数创建对象，
     * 然后再通过 setter 方法填充数据
     *
     * 类比前端：就像 class 的默认构造函数
     */
    public Post() {}

    /**
     * 全参构造函数
     *
     * 方便在代码中快速创建 Post 对象：
     *   Post post = new Post(1L, 2L, "标题", "内容");
     *
     * @param id     帖子 ID
     * @param userId 用户 ID
     * @param title  标题
     * @param body   正文
     */
    public Post(Long id, Long userId, String title, String body) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.body = body;
    }

    // =====================================================
    // Getter 和 Setter 方法
    // =====================================================
    //
    // 为什么 Java 需要 Getter/Setter？
    //
    // Java 的"封装"原则：字段设为 private（外部不能直接访问），
    // 通过 public 方法来读取（getter）和修改（setter）。
    //
    // 类比前端：
    //   getter → 就像 TypeScript 的 get 访问器
    //   setter → 就像 TypeScript 的 set 访问器
    //
    // 例如：
    //   post.getId()       ←→   post.id
    //   post.setTitle("x") ←→   post.title = "x"
    //
    // Spring 在把 Java 对象转成 JSON 时，也是通过 getter 方法读取值的

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    // =====================================================
    // toString 方法
    // =====================================================

    /**
     * 返回对象的字符串表示，方便调试时打印
     *
     * 类比前端：就像 JSON.stringify(post)
     *
     * 使用场景：
     *   System.out.println(post);  → 会自动调用 toString()
     *   输出：Post{id=1, userId=2, title='标题'}
     */
    @Override
    public String toString() {
        return "Post{id=" + id + ", userId=" + userId + ", title='" + title + "'}";
    }
}
