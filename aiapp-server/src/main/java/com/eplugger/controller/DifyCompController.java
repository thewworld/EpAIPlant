package com.eplugger.controller;

import com.eplugger.model.DifyRequest;
import com.eplugger.service.DifyCompService;
import com.eplugger.service.DifyAppService;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

/**
 * Dify文本生成控制器
 * 
 * @author jishuangjiang
 * @date 2025/3/25 10:00:00
 */
@RestController
@RequestMapping("/api/dify/completion")
@Log4j2
public class DifyCompController {

    @Autowired
    private DifyCompService difyCompService;

    @Autowired
    private DifyAppService difyAppService;

    /**
     * 发送文本生成消息（流式响应）
     *
     * @param appId   应用ID
     * @param request 文本生成请求
     * @return SSE响应
     */
    @PostMapping(value = "/messages/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter sendCompletionMessageStream(
            @RequestParam Long appId,
            @RequestBody DifyRequest.CompletionRequest request) {
        log.info("发送文本生成消息(流式响应) - appId: {}, 用户: {}", appId, request.getUser());

        // 获取API密钥
        String apiKey = difyAppService.getApiKeyById(appId);

        // 创建SSE发射器，超时时间设置为10分钟
        SseEmitter sseEmitter = new SseEmitter(10 * 60 * 1000L);

        try {
            // 设置SSE连接建立时的回调
            //sseEmitter.onCompletion(() -> log.info("SSE连接完成 - 用户: {}", request.getUser()));
            //sseEmitter.onTimeout(() -> log.info("SSE连接超时 - 用户: {}", request.getUser()));
            //sseEmitter.onError(ex -> log.error("SSE连接错误 - 用户: {}, 错误: {}", request.getUser(), ex.getMessage()));

/*            sseEmitter.send(SseEmitter.event().data("{\"answer\": \"我正在生成文本...\\n\"}"));
            Thread.sleep(1000);
            sseEmitter.send(SseEmitter.event().data("{\"answer\": \"我正在生成文本...\\n\"}"));
            Thread.sleep(1000);
            sseEmitter.send(SseEmitter.event().data("{\"answer\": \"我正在生成文本...\\n\"}"));
            Thread.sleep(1000);
            sseEmitter.send(SseEmitter.event().data("{\"answer\": \"我正在生成文本...\\n\"}"));
            Thread.sleep(1000);
            sseEmitter.send(SseEmitter.event().data("{\"answer\": \"我正在生成文本...\\n\"}"));
            Thread.sleep(1000);
            sseEmitter.send(SseEmitter.event().data("{\"answer\": \"我正在生成文本...\\n\"}"));
            Thread.sleep(1000);
            sseEmitter.send(SseEmitter.event().data("{\"answer\": \"我正在生成文本...\\n\"}"));
            Thread.sleep(1000);
            sseEmitter.complete();*/
            // 调用文本生成服务
            difyCompService.sendCompletionMessageStream(
                    request.getQuery(),
                    request.getInputs(),
                    request.getUser(),
                    request.getFiles(),
                    apiKey,
                    sseEmitter);

        } catch (Exception e) {
            log.error("发送文本生成消息失败 - 用户: {}, 错误: {}", request.getUser(), e.getMessage());
            sseEmitter.completeWithError(e);
        }

        return sseEmitter;
    }

    /**
     * 发送文本生成消息（阻塞响应）
     *
     * @param appId   应用ID
     * @param request 文本生成请求
     * @return 文本生成结果
     */
    @PostMapping("/messages/block")
    public ResponseEntity<Map<String, Object>> sendCompletionMessageBlock(
            @RequestParam Long appId,
            @RequestBody DifyRequest.CompletionRequest request) {
        log.info("发送文本生成消息(阻塞响应) - appId: {}, 用户: {}", appId, request.getUser());

        // 获取API密钥
        String apiKey = difyAppService.getApiKeyById(appId);

        try {
            Map<String, Object> result = difyCompService.sendCompletionMessageBlock(
                    request.getQuery(),
                    request.getInputs(),
                    request.getUser(),
                    request.getFiles(),
                    apiKey);

            // 如果结果包含错误信息，返回400状态码
            if (result.containsKey("error")) {
                return ResponseEntity.badRequest().body(result);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("发送文本生成消息失败 - appId: {}, 用户: {}, 错误: {}", appId, request.getUser(), e.getMessage());
            throw e;
        }
    }
}