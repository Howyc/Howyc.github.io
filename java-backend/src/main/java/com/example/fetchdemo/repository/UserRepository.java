package com.example.fetchdemo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.fetchdemo.entity.User;

/**
 * 用户数据访问接口 (Repository)
 * 
 * 什么是 Repository？
 * - Repository 是数据访问层，负责与数据库交互
 * - 类似于前端的 API 服务层，但操作的是数据库而不是 HTTP
 * 
 * Spring Data JPA 的魔法：
 * - 你只需要定义接口，不需要写实现代码！
 * - Spring 会在运行时自动生成实现类
 * - 根据方法名自动生成 SQL 查询
 * 
 * 类比前端：
 * - 就像 Prisma Client，定义好 schema 后自动生成查询方法
 * - 类似 React Query 的 useQuery，但操作数据库
 * 
 * @Repository: 标记这是一个数据访问组件
 * 
 * JpaRepository<User, Long> 的含义：
 * - User: 实体类型
 * - Long: 主键类型
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // ============================================
    // 继承自 JpaRepository 的方法（自动获得，无需定义）
    // ============================================
    //
    // save(User user)           - 保存或更新用户
    // findById(Long id)         - 按 ID 查询
    // findAll()                 - 查询所有用户
    // deleteById(Long id)       - 按 ID 删除
    // count()                   - 统计数量
    // existsById(Long id)       - 判断是否存在
    //
    // 这些方法都是自动实现的，直接调用即可！

    // ============================================
    // 自定义查询方法（Spring Data JPA 根据方法名自动生成 SQL）
    // ============================================

    /**
     * 按城市查询用户
     * 
     * 方法名解析：
     * - findBy: 表示查询操作
     * - City: 表示按 city 字段查询
     * 
     * Spring Data JPA 会自动生成 SQL：
     * SELECT * FROM users WHERE city = ?
     * 
     * @param city 城市名称
     * @return 该城市的所有用户
     */
    List<User> findByCity(String city);

    /**
     * 按邮箱关键字模糊查询
     * 
     * 方法名解析：
     * - findBy: 查询操作
     * - Email: 按 email 字段
     * - Containing: 包含（模糊匹配）
     * 
     * 自动生成 SQL：
     * SELECT * FROM users WHERE email LIKE '%keyword%'
     * 
     * @param keyword 邮箱关键字
     * @return 邮箱包含该关键字的用户
     */
    List<User> findByEmailContaining(String keyword);

    /**
     * 按用户名查询
     * 
     * @param username 用户名
     * @return 匹配的用户列表
     */
    List<User> findByUsername(String username);

    /**
     * 按公司名称查询
     * 
     * @param company 公司名称
     * @return 该公司的所有用户
     */
    List<User> findByCompany(String company);

    // ============================================
    // 使用 @Query 自定义 SQL（更复杂的查询）
    // ============================================

    /**
     * 统计每个城市的用户数量
     * 
     * @Query: 使用 JPQL (Java Persistence Query Language) 编写查询
     * JPQL 类似 SQL，但操作的是实体而不是表
     * 
     * @return 城市和用户数量的列表
     */
    @Query("SELECT u.city, COUNT(u) FROM User u GROUP BY u.city")
    List<Object[]> countUsersByCity();

    /**
     * 查询所有不同的城市
     * 
     * @return 城市列表（去重）
     */
    @Query("SELECT DISTINCT u.city FROM User u WHERE u.city IS NOT NULL")
    List<String> findAllCities();

    /**
     * 查询所有不同的公司
     * 
     * @return 公司列表（去重）
     */
    @Query("SELECT DISTINCT u.company FROM User u WHERE u.company IS NOT NULL")
    List<String> findAllCompanies();

    /**
     * 查询最大 ID
     *
     * 比 findAll().stream().mapToLong(...).max() 高效得多：
     * 只执行一条 SQL：SELECT MAX(u.id) FROM users
     * 而不是把所有数据加载到内存再遍历
     *
     * @return 最大 ID，没有数据时返回 null
     */
    @Query("SELECT MAX(u.id) FROM User u")
    Long findMaxId();
}
