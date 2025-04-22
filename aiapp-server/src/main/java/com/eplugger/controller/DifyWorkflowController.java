package com.eplugger.controller;

import com.eplugger.model.DifyRequest;
import com.eplugger.service.DifyWorkflowService;
import com.eplugger.service.DifyAppService;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

/**
 * Dify工作流控制器
 * 
 * @author jishuangjiang
 * @date 2025/3/25 10:00:00
 */
@RestController
@RequestMapping("/api/dify/workflow")
@Log4j2
public class DifyWorkflowController {

    @Autowired
    private DifyWorkflowService difyWorkflowService;

    @Autowired
    private DifyAppService difyAppService;

    /**
     * 执行工作流（流式响应）
     *
     * @param appId   应用ID
     * @param request 工作流请求
     * @return SSE响应
     */
    @PostMapping(value = "/run/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter workflowRun(
            @RequestParam Long appId,
            @RequestBody DifyRequest.WorkflowRequest request) {
        log.info("执行工作流(流式响应) - appId: {}, 用户: {}", appId, request.getUser());

        // 获取API密钥
        String apiKey = difyAppService.getApiKeyById(appId);

        SseEmitter sseEmitter = new SseEmitter(-1L); // 无超时

        try {
            // 设置SSE连接建立时的回调
            sseEmitter.onCompletion(() -> log.info("SSE连接完成 - 用户: {}", request.getUser()));
            sseEmitter.onTimeout(() -> log.info("SSE连接超时 - 用户: {}", request.getUser()));
            sseEmitter.onError(ex -> log.error("SSE连接错误 - 用户: {}, 错误: {}", request.getUser(), ex.getMessage()));

            // 调用工作流服务
            difyWorkflowService.workflowRun(
                    request.getInputs(),
                    "streaming",
                    request.getUser(),
                    apiKey,
                    sseEmitter);

        } catch (Exception e) {
            log.error("执行工作流失败 - 用户: {}, 错误: {}", request.getUser(), e.getMessage());
            sseEmitter.completeWithError(e);
        }

        return sseEmitter;
    }

    /**
     * 执行工作流（阻塞响应）
     *
     * @param appId   应用ID
     * @param request 工作流请求
     * @return 工作流执行结果
     */
    @PostMapping("/run/block")
    public ResponseEntity<Map<String, Object>> workflowRunBlock(
            @RequestParam Long appId,
            @RequestBody DifyRequest.WorkflowRequest request) {
        log.info("执行工作流(阻塞响应) - appId: {}, 用户: {}", appId, request.getUser());

        // 获取API密钥
        String apiKey = difyAppService.getApiKeyById(appId);

        try {
            Map<String, Object> result = difyWorkflowService.workflowRunBlock(
                    request.getInputs(),
                    request.getUser(),
                    apiKey);

            // 如果结果包含错误信息，返回400状态码
            if (result.containsKey("error")) {
                return ResponseEntity.badRequest().body(result);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("执行工作流失败 - appId: {}, 用户: {}, 错误: {}", appId, request.getUser(), e.getMessage());
            throw e;
        }
    }
}