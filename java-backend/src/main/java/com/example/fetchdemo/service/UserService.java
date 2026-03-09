package com.example.fetchdemo.service;

import java.util.ArrayList;
import java.util.Collections;
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
import org.springframework.web.client.RestTemplate;

import com.example.fetchdemo.entity.User;
import com.example.fetchdemo.repository.UserRepository;

/**
 * 用户业务逻辑服务类
 *
 * =====================================================
 * 三层架构中的 Service 层
 * =====================================================
 * 请求流程：
 *   HTTP 请求 → Controller（接收请求）
 *             → Service（这里，处理业务逻辑）
 *             → Repository（操作数据库）
 *             → Database（SQLite）
 *
 * Service 层的职责：
 * - 处理业务逻辑（如：批量保存时去重、统计数量等）
 * - 调用 Repository 操作数据库
 * - 不直接处理 HTTP 请求/响应（那是 Controller 的事）
 *
 * 类比前端：
 *   Controller ←→ React 组件（接收用户操作）
 *   Service    ←→ 自定义 Hook 或 store（处理业务逻辑）
 *   Repository ←→ api.ts（实际发请求/操作数据）
 *
 * @Service → 告诉 Spring：这是一个服务组件，需要自动管理（依赖注入）
 */
@Service
public class UserService {

    /**
     * 日志记录器
     *
     * 为什么用 Logger 而不是 System.out.println？
     * - Logger 可以控制日志级别：DEBUG / INFO / WARN / ERROR
     * - 生产环境可以只显示 WARN 以上的日志，过滤掉调试信息
     * - 日志可以输出到文件，方便排查问题
     * - 类比前端：就像 console.log，但更专业
     *
     * LoggerFactory.getLogger(UserService.class)
     * → 创建一个属于 UserService 的 logger，日志里会显示类名
     *
     * 使用方式：
     *   log.debug("调试信息: {}", value);   // 开发时用
     *   log.info("操作信息: {}", value);    // 记录重要操作
     *   log.warn("警告: {}", value);        // 非致命问题
     *   log.error("错误: {}", e.getMessage()); // 严重错误
     *
     * {} 是占位符，类似 JS 的模板字符串 `值: ${value}`
     */
    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    /**
     * 用户数据访问对象（依赖注入）
     *
     * 为什么用 final？
     * - final 表示这个引用不会被重新赋值
     * - 配合构造函数注入，确保依赖在对象创建时就确定，不会被意外修改
     */
    private final UserRepository userRepository;

    /**
     * HTTP 客户端，用于调用外部 API
     *
     * RestTemplate 是 Spring 提供的 HTTP 客户端工具
     * 类比前端：就像 fetch() 或 axios
     *
     * 使用示例：
     *   restTemplate.getForObject(url, User[].class)
     *   ←→ 前端的 fetch(url).then(r => r.json())
     */
    private final RestTemplate restTemplate;

    /** JSONPlaceholder 用户 API 地址（外部测试数据源） */
    private static final String JSONPLACEHOLDER_USERS_URL =
            "https://jsonplaceholder.typicode.com/users";

    /**
     * 构造函数注入
     *
     * =====================================================
     * 为什么用构造函数注入，而不是 @Autowired 字段注入？
     * =====================================================
     * 字段注入（不推荐）：
     *   @Autowired
     *   private UserRepository userRepository;  // 字段可以是 null，难以测试
     *
     * 构造函数注入（推荐）：
     *   public UserService(UserRepository userRepository) { ... }
     *
     * 优点：
     * 1. 依赖关系清晰：一眼就能看出这个类需要哪些依赖
     * 2. 便于测试：可以直接 new UserService(mockRepository) 传入 mock 对象
     * 3. 不可变性：配合 final 字段，确保依赖不会被意外修改
     * 4. 避免循环依赖：Spring 在启动时就能检测到循环依赖问题
     *
     * @Autowired 在只有一个构造函数时可以省略，Spring 会自动识别
     */
    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.restTemplate = new RestTemplate();
    }

    // ============================================
    // 查询方法
    // ============================================

    /**
     * 获取所有用户
     * 直接委托给 Repository，无额外业务逻辑
     *
     * @return 所有用户列表
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * 按 ID 查询用户
     *
     * 返回 Optional<User> 而不是 User，原因：
     * - 用户可能不存在，Optional 强制调用方处理"不存在"的情况
     * - 避免 NullPointerException（空指针异常）
     *
     * 类比前端 TypeScript：
     *   Optional<User>  ←→  User | undefined
     *   optional.isPresent()  ←→  user !== undefined
     *   optional.get()        ←→  user!（非空断言）
     *
     * @param id 用户 ID
     * @return Optional 包装的用户（存在则有值，不存在则为 empty）
     */
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * 按城市查询用户
     *
     * @param city 城市名称
     * @return 该城市的用户列表
     */
    public List<User> getUsersByCity(String city) {
        return userRepository.findByCity(city);
    }

    /**
     * 按邮箱关键字模糊搜索
     *
     * @param keyword 邮箱关键字（如 "gmail" 会匹配所有 gmail 邮箱）
     * @return 匹配的用户列表
     */
    public List<User> searchUsersByEmail(String keyword) {
        return userRepository.findByEmailContaining(keyword);
    }

    /**
     * 获取用户总数
     *
     * @return 数据库中的用户数量
     */
    public long getUserCount() {
        return userRepository.count();
    }

    /**
     * 获取所有城市列表（去重）
     *
     * @return 不重复的城市名称列表
     */
    public List<String> getAllCities() {
        return userRepository.findAllCities();
    }

    /**
     * 获取所有公司列表（去重）
     *
     * @return 不重复的公司名称列表
     */
    public List<String> getAllCompanies() {
        return userRepository.findAllCompanies();
    }

    /**
     * 获取统计信息
     *
     * 返回 Map<String, Object> 而不是专门的 DTO 类，
     * 适合字段不固定或临时聚合的场景。
     * 更规范的做法是定义一个 StatsDTO 类。
     *
     * @return 包含 totalUsers、cities、companies 的统计 Map
     */
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("cities", userRepository.findAllCities());
        stats.put("companies", userRepository.findAllCompanies());
        return stats;
    }

    // ============================================
    // 增删改方法
    // ============================================

    /**
     * 保存（新增或更新）用户
     *
     * JPA 的 save() 行为：
     * - 如果 user.id 不存在于数据库 → INSERT（新增）
     * - 如果 user.id 已存在于数据库 → UPDATE（更新）
     *
     * @param user 要保存的用户对象
     * @return 保存后的用户（包含数据库生成的字段，如 createdAt）
     */
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    /**
     * 按 ID 删除用户
     *
     * 注意：如果 ID 不存在，JPA 会抛出 EmptyResultDataAccessException
     * 调用前应先用 getUserById() 检查是否存在（Controller 层已处理）
     *
     * @param id 要删除的用户 ID
     */
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    /**
     * 获取下一个可用 ID
     *
     * 为什么不用数据库自增 ID？
     * 因为数据来自外部 API（JSONPlaceholder），ID 是固定的（1-10）
     * 手动新增用户时，需要在最大 ID 基础上 +1
     *
     * 实现方式：
     * - 用 @Query("SELECT MAX(u.id) FROM User u") 直接查最大值
     * - 比 findAll().stream().mapToLong(User::getId).max() 高效得多
     * - 只执行一条 SQL，不把所有数据加载到内存
     *
     * @return 下一个可用的 ID（最大 ID + 1，没有数据时返回 1）
     */
    public Long getNextId() {
        Long maxId = userRepository.findMaxId();
        return (maxId != null ? maxId : 0L) + 1;
    }

    // ============================================
    // 批量保存（性能优化版）
    // ============================================

    /**
     * 批量保存用户数据
     *
     * =====================================================
     * @Transactional 注解的作用
     * =====================================================
     * 事务（Transaction）：一组操作要么全部成功，要么全部回滚。
     *
     * 例如：批量保存 100 个用户，第 50 个失败了：
     * - 没有 @Transactional：前 49 个已保存，后 51 个没保存 → 数据不一致
     * - 有 @Transactional：全部回滚，数据库保持原样 → 数据一致
     *
     * 类比前端：就像数据库的 transaction，或者 Promise.all（要么全成功要么全失败）
     *
     * =====================================================
     * 性能优化：批量查询 vs 逐条查询
     * =====================================================
     * 旧写法（慢）：
     *   for (userData : usersData) {
     *     if (repository.existsById(id)) { ... }  // 每条数据 1 次查询
     *     repository.save(user);                   // 每条数据 1 次保存
     *   }
     *   → 100 条数据 = 200 次数据库查询
     *
     * 新写法（快）：
     *   repository.findAllById(ids)  // 1 次查询，获取所有已存在的 ID
     *   repository.saveAll(users)    // 1 次批量保存
     *   → 100 条数据 = 2 次数据库查询
     *
     * =====================================================
     * Stream API 说明
     * =====================================================
     * Java 的 Stream API 类似前端的数组方法：
     *   .stream()           ←→  （开始链式操作）
     *   .map(fn)            ←→  .map(fn)
     *   .filter(fn)         ←→  .filter(fn)
     *   .collect(toList())  ←→  （结束，收集结果）
     *
     * 例如：
     *   usersData.stream()
     *     .map(this::extractUserId)   // 提取每条数据的 ID
     *     .filter(id -> id != null)   // 过滤掉 null
     *     .collect(Collectors.toList()) // 收集成 List
     *
     * ←→ 前端：
     *   usersData
     *     .map(d => extractUserId(d))
     *     .filter(id => id !== null)
     *
     * @param usersData 用户数据列表（Map 格式，兼容前端和外部 API 两种格式）
     * @return 包含 savedCount、updatedCount、failedCount 的结果 Map
     */
    @Transactional
    public Map<String, Object> batchSaveUsers(List<Map<String, Object>> usersData) {
        log.info("批量保存用户，数量: {}", usersData.size());

        List<User> toSave = new ArrayList<>();
        int failedCount = 0;

        // 步骤 1：一次性查出所有已存在的 ID（只有 1 次数据库查询）
        // 类比前端：const existingIds = new Set(await db.findAllById(ids))
        List<Long> incomingIds = usersData.stream()
                .map(this::extractUserId)
                .filter(id -> id != null)
                .collect(Collectors.toList());

        // findAllById：根据 ID 列表批量查询，返回已存在的记录
        // 然后提取 ID 存入 Set（Set 的 contains() 是 O(1) 查找，比 List 快）
        Set<Long> existingIds = userRepository.findAllById(incomingIds)
                .stream()
                .map(User::getId)  // 方法引用，等同于 u -> u.getId()
                .collect(Collectors.toSet());

        // 步骤 2：将 Map 数据转换为 User 实体对象
        for (Map<String, Object> userData : usersData) {
            try {
                User user = convertFromMap(userData);
                toSave.add(user);
            } catch (Exception e) {
                log.warn("转换用户数据失败: {}", e.getMessage());
                failedCount++;
            }
        }

        // 步骤 3：批量保存（只有 1 次数据库查询）
        // saveAll() 比循环调用 save() 效率高得多
        List<User> saved = userRepository.saveAll(toSave);

        // 统计新增和更新的数量
        // 如果保存的 ID 在 existingIds 里 → 是更新；否则 → 是新增
        int updatedCount = (int) saved.stream().filter(u -> existingIds.contains(u.getId())).count();
        int savedCount = saved.size() - updatedCount;

        log.info("批量保存完成: 新增={}, 更新={}, 失败={}", savedCount, updatedCount, failedCount);

        Map<String, Object> result = new HashMap<>();
        result.put("success", failedCount == 0);
        result.put("savedCount", savedCount);
        result.put("updatedCount", updatedCount);
        result.put("failedCount", failedCount);
        result.put("totalProcessed", usersData.size());
        result.put("message", String.format("新增 %d 条，更新 %d 条", savedCount, updatedCount));
        return result;
    }

    // ============================================
    // 外部 API 获取
    // ============================================

    /**
     * 从 JSONPlaceholder 获取所有用户并保存到数据库
     *
     * RestTemplate.getForObject(url, Class) 的作用：
     * - 发送 GET 请求到指定 URL
     * - 把响应 JSON 自动反序列化为指定类型
     * - 类比前端：fetch(url).then(r => r.json()) as User[]
     *
     * Object[].class 而不是 User[].class：
     * - JSONPlaceholder 返回的是嵌套结构（address.city, company.name）
     * - 直接映射到 User 会丢失嵌套字段
     * - 所以先用 Object[]（实际是 Map[]），再手动转换
     *
     * @SuppressWarnings("unchecked") 抑制类型转换警告
     * - 因为 Object 转 Map<String, Object> 是"不安全"的强制转换
     * - 我们知道 JSONPlaceholder 返回的确实是 Map 结构，所以这里是安全的
     *
     * @return 保存后的用户列表
     */
    @SuppressWarnings("unchecked")
    public List<User> fetchAndSaveAllUsers() {
        log.info("从外部 API 获取用户数据");
        Object[] rawUsers = restTemplate.getForObject(JSONPLACEHOLDER_USERS_URL, Object[].class);

        if (rawUsers == null) {
            return Collections.emptyList();  // 返回空列表，而不是 null（避免 NPE）
        }

        List<User> users = new ArrayList<>();
        for (Object raw : rawUsers) {
            users.add(convertFromMap((Map<String, Object>) raw));
        }
        return userRepository.saveAll(users);
    }

    /**
     * 从 JSONPlaceholder 获取单个用户并保存
     *
     * @param id 用户 ID（1-10）
     * @return Optional 包装的用户（API 返回 null 时为 empty）
     */
    @SuppressWarnings("unchecked")
    public Optional<User> fetchAndSaveUser(Long id) {
        String url = JSONPLACEHOLDER_USERS_URL + "/" + id;
        Map<String, Object> userData = restTemplate.getForObject(url, Map.class);
        if (userData == null) return Optional.empty();
        return Optional.of(userRepository.save(convertFromMap(userData)));
    }

    // ============================================
    // 私有辅助方法
    // ============================================

    /**
     * 将 Map 数据转换为 User 实体
     *
     * =====================================================
     * 为什么需要这个方法？
     * =====================================================
     * 数据来源有两种格式：
     *
     * 1. 前端扁平格式（手动新增用户时）：
     *    { "id": 11, "name": "张三", "city": "Beijing", "company": "阿里巴巴" }
     *
     * 2. JSONPlaceholder 嵌套格式（从外部 API 获取时）：
     *    {
     *      "id": 1,
     *      "name": "Leanne Graham",
     *      "address": { "city": "Gwenborough" },  ← city 在嵌套对象里
     *      "company": { "name": "Romaguera-Crona" } ← company 也是嵌套对象
     *    }
     *
     * 这个方法兼容两种格式，统一转换为 User 实体。
     *
     * =====================================================
     * instanceof 模式匹配（Java 16+ 新特性）
     * =====================================================
     * 旧写法：
     *   if (obj instanceof Map) {
     *     Map<String, Object> map = (Map<String, Object>) obj;  // 需要强制转换
     *     ...
     *   }
     *
     * 新写法（模式匹配）：
     *   if (obj instanceof Map<?, ?> map) {  // 自动转换，更简洁
     *     ...
     *   }
     *
     * 类比前端 TypeScript：
     *   if (typeof obj === 'object' && obj !== null) { ... }
     *
     * @param data 原始 Map 数据
     * @return 转换后的 User 实体
     */
    @SuppressWarnings("unchecked")
    private User convertFromMap(Map<String, Object> data) {
        User user = new User();
        user.setId(extractUserId(data));
        user.setName(getString(data, "name"));
        user.setUsername(getString(data, "username"));
        user.setEmail(getString(data, "email"));
        user.setPhone(getString(data, "phone"));
        user.setWebsite(getString(data, "website"));

        // city：优先取扁平字段（前端格式），其次从 address.city 取（JSONPlaceholder 格式）
        String city = getString(data, "city");
        if (city == null && data.get("address") instanceof Map<?, ?> addr) {
            city = getString((Map<String, Object>) addr, "city");
        }
        user.setCity(city);

        // company：可能是字符串（前端格式）或嵌套对象（JSONPlaceholder 格式）
        Object companyObj = data.get("company");
        if (companyObj instanceof String s) {
            user.setCompany(s);
        } else if (companyObj instanceof Map<?, ?> companyMap) {
            user.setCompany(getString((Map<String, Object>) companyMap, "name"));
        }

        return user;
    }

    /**
     * 从 Map 中提取用户 ID
     *
     * 处理两种情况：
     * - Number 类型（JSON 数字）：直接转 Long
     * - String 类型（字符串数字）：用 Long.parseLong 转换
     *
     * @param data 包含 id 字段的 Map
     * @return Long 类型的 ID，无法解析时返回 null
     */
    private Long extractUserId(Map<String, Object> data) {
        Object idObj = data.get("id");
        if (idObj instanceof Number n) return n.longValue();
        if (idObj instanceof String s) {
            try { return Long.parseLong(s); } catch (NumberFormatException ignored) {}
        }
        return null;
    }

    /**
     * 安全地从 Map 中获取字符串值
     *
     * 如果值为 null，返回 null（而不是抛出异常）
     * 如果值不是 String，调用 toString() 转换
     *
     * @param map 数据 Map
     * @param key 字段名
     * @return 字符串值，不存在时返回 null
     */
    private String getString(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val != null ? val.toString() : null;
    }
}
