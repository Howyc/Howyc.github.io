package com.example.fetchdemo.entity;

// JPA 注解导入
import jakarta.persistence.*;
// Bean Validation 注解导入
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * 用户实体类 (Entity)
 * 
 * 什么是实体？
 * - 实体是 Java 对象和数据库表之间的映射
 * - 一个实体类对应数据库中的一张表
 * - 实体的每个属性对应表中的一列
 * 
 * 类比前端：
 * - 就像 TypeScript 的 interface，但会自动映射到数据库
 * - 类似 Prisma 的 model 定义
 * 
 * @Entity: 标记这是一个 JPA 实体，Hibernate 会为它创建数据库表
 * @Table: 指定数据库表名（如果不指定，默认使用类名）
 */
@Entity
@Table(name = "users")
public class User {

    /**
     * 用户 ID（主键）
     * 
     * @Id: 标记这是主键字段
     * 
     * 注意：我们不使用 @GeneratedValue，因为 ID 来自外部 API
     * 如果需要自动生成 ID，可以添加：
     * @GeneratedValue(strategy = GenerationType.IDENTITY)
     */
    @Id
    private Long id;

    /**
     * 用户姓名
     * 
     * @Column: 指定列的属性
     * - length: 最大长度
     * - nullable: 是否允许为空
     */
    @NotBlank
    @Size(max = 100)
    @Column(length = 100)
    private String name;

    /**
     * 用户名（登录名）
     */
    @Column(length = 50)
    private String username;

    /**
     * 邮箱地址
     */
    @Email
    @Column(length = 100)
    private String email;

    /**
     * 电话号码
     */
    @Column(length = 50)
    private String phone;

    /**
     * 个人网站
     */
    @Column(length = 100)
    private String website;

    /**
     * 城市（从 address.city 提取）
     */
    @Column(length = 100)
    private String city;

    /**
     * 公司名称（从 company.name 提取）
     */
    @Column(length = 100)
    private String company;

    /**
     * 创建时间
     * 记录数据首次插入的时间
     */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     * 记录数据最后更新的时间
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ============================================
    // 构造函数
    // ============================================

    /**
     * 无参构造函数
     * JPA 要求实体必须有一个无参构造函数
     */
    public User() {
    }

    /**
     * 全参构造函数
     * 方便创建用户对象
     */
    public User(Long id, String name, String username, String email, 
                String phone, String website, String city, String company) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.website = website;
        this.city = city;
        this.company = company;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // ============================================
    // JPA 生命周期回调
    // ============================================

    /**
     * 在插入数据前自动执行
     * 设置创建时间和更新时间
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 在更新数据前自动执行
     * 更新"更新时间"字段
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ============================================
    // Getter 和 Setter 方法
    // ============================================
    // 
    // 为什么需要 Getter/Setter？
    // - Java 的封装原则：属性设为 private，通过方法访问
    // - JPA 需要通过这些方法读写属性值
    // - 类比前端：就像 Vue 的 computed 属性或 React 的 state

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // ============================================
    // toString 方法
    // ============================================

    /**
     * 返回对象的字符串表示
     * 方便调试和日志输出
     */
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", city='" + city + '\'' +
                ", company='" + company + '\'' +
                '}';
    }
}
