package com.example.fetchdemo.common;

/**
 * 统一 API 响应结构
 *
 * =====================================================
 * 为什么需要统一响应格式？
 * =====================================================
 * 没有统一格式时，每个接口返回的结构都不一样：
 *   /api/users    → { id: 1, name: "..." }
 *   /api/error    → "用户不存在"
 *   /api/count    → 42
 *
 * 有了统一格式，前端处理起来更方便：
 *   成功：{ "success": true,  "data": {...},  "message": "操作成功" }
 *   失败：{ "success": false, "data": null,   "message": "用户不存在" }
 *
 * 类比前端 TypeScript：
 *   interface ApiResponse<T> {
 *     success: boolean;   // 是否成功
 *     data: T | null;     // 返回的数据（泛型，可以是任意类型）
 *     message: string;    // 提示信息
 *   }
 *
 * =====================================================
 * 泛型 <T> 是什么？
 * =====================================================
 * <T> 是"类型参数"，类似 TypeScript 的泛型。
 * 使用时指定具体类型：
 *   ApiResponse<User>        → data 是 User 类型
 *   ApiResponse<List<User>>  → data 是 List<User> 类型
 *   ApiResponse<Long>        → data 是 Long（数字）类型
 *   ApiResponse<Void>        → data 是 null（无数据）
 *
 * =====================================================
 * 工厂方法模式
 * =====================================================
 * 构造函数是 private 的，不能直接 new ApiResponse(...)
 * 必须通过静态工厂方法创建：
 *   ApiResponse.ok(data)          → 成功
 *   ApiResponse.ok(data, message) → 成功（自定义消息）
 *   ApiResponse.fail("错误信息")   → 失败
 *
 * 好处：语义更清晰，调用方不需要关心内部构造细节
 *
 * @param <T> 数据类型（泛型），可以是 User、Post、List<User> 等任意类型
 */
public class ApiResponse<T> {

    /**
     * 是否成功
     * true = 操作成功，false = 操作失败
     */
    private final boolean success;

    /**
     * 返回的数据
     * 成功时包含实际数据，失败时为 null
     * final 表示一旦赋值就不能修改（不可变对象）
     */
    private final T data;

    /**
     * 提示信息
     * 成功时："操作成功" 或自定义消息
     * 失败时：具体的错误原因
     */
    private final String message;

    /**
     * 私有构造函数
     *
     * 为什么是 private？
     * 强制外部代码使用静态工厂方法（ok/fail），
     * 而不是直接 new ApiResponse(true, data, "...")
     * 这样代码更易读：ApiResponse.ok(user) 比 new ApiResponse(true, user, "操作成功") 更清晰
     */
    private ApiResponse(boolean success, T data, String message) {
        this.success = success;
        this.data = data;
        this.message = message;
    }

    /**
     * 创建成功响应（带数据，默认消息"操作成功"）
     *
     * 使用示例：
     *   return ApiResponse.ok(user);
     *   → { "success": true, "data": {...user}, "message": "操作成功" }
     *
     * @param <T>  数据类型（由传入的 data 自动推断）
     * @param data 要返回的数据
     * @return 成功响应对象
     */
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, "操作成功");
    }

    /**
     * 创建成功响应（带数据和自定义消息）
     *
     * 使用示例：
     *   return ApiResponse.ok(users, "成功获取 10 个用户");
     *   → { "success": true, "data": [...], "message": "成功获取 10 个用户" }
     *
     * @param <T>     数据类型
     * @param data    要返回的数据
     * @param message 自定义成功消息
     * @return 成功响应对象
     */
    public static <T> ApiResponse<T> ok(T data, String message) {
        return new ApiResponse<>(true, data, message);
    }

    /**
     * 创建失败响应
     *
     * 使用示例：
     *   return ApiResponse.fail("用户不存在，ID: 999");
     *   → { "success": false, "data": null, "message": "用户不存在，ID: 999" }
     *
     * @param <T>     数据类型（失败时 data 为 null，但泛型仍需声明）
     * @param message 错误信息
     * @return 失败响应对象
     */
    public static <T> ApiResponse<T> fail(String message) {
        return new ApiResponse<>(false, null, message);
    }

    /**
     * 创建失败响应（带数据）
     *
     * 使用示例：
     *   Map<String, String> errors = Map.of("name", "姓名不能为空");
     *   return ApiResponse.fail("参数校验失败", errors);
     *   → { "success": false, "data": {"name":"姓名不能为空"}, "message": "参数校验失败" }
     *
     * @param <T>     数据类型
     * @param message 错误信息
     * @param data    附带的错误详情数据
     * @return 失败响应对象
     */
    public static <T> ApiResponse<T> fail(String message, T data) {
        return new ApiResponse<>(false, data, message);
    }

    // =====================================================
    // Getter 方法
    // =====================================================
    // 没有 Setter，因为字段是 final 的（不可变）
    // Spring 在把对象转成 JSON 时，会调用这些 getter 方法

    /** @return 是否成功 */
    public boolean isSuccess() { return success; }

    /** @return 返回的数据（失败时为 null） */
    public T getData() { return data; }

    /** @return 提示信息 */
    public String getMessage() { return message; }
}
