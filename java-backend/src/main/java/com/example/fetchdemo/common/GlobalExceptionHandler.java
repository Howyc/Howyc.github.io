package com.example.fetchdemo.common;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器
 *
 * 使用 @RestControllerAdvice 统一捕获 Controller 层抛出的异常，
 * 返回标准的 ApiResponse 格式，避免每个 Controller 重复处理异常逻辑。
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理 Bean Validation 校验失败异常
     *
     * 当 Controller 方法参数标注了 @Valid，且请求体校验不通过时，
     * Spring 会抛出 MethodArgumentNotValidException。
     * 此方法提取所有字段错误，返回 HTTP 400 + 字段名到错误信息的 Map。
     *
     * 响应示例：
     * {
     *   "success": false,
     *   "data": { "name": "不能为空", "email": "不是一个合法的电子邮件地址" },
     *   "message": "参数校验失败"
     * }
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            fieldErrors.put(error.getField(), error.getDefaultMessage())
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail("参数校验失败", fieldErrors));
    }
}
