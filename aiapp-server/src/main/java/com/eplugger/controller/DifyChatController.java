package com.eplugger.controller;

import cn.hutool.core.exceptions.ExceptionUtil;
import cn.hutool.json.JSONObject;
import com.eplugger.model.DifyApp;
import com.eplugger.model.DifyRequest;
import com.eplugger.service.DifyAppService;
import com.eplugger.service.DifyChatService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * @author jishuangjiang
 * @date 2025/3/21 17:56:00
 */
@RestController
@RequestMapping("/api/dify")
@Log4j2
public class DifyChatController {

    @Autowired
    private DifyChatService difyService;

    @Autowired
    private DifyAppService difyAppService;

    /**
     * 发送对话消息
     *
     * @param appId   应用ID
     * @param request 消息请求
     * @return 流式响应
     */
    @PostMapping(value = "/chat-messages", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter sendChatMessage(@RequestParam Long appId, @RequestBody DifyRequest.ChatMessageRequest request, HttpServletResponse response) {
        log.info("接收到聊天消息请求: appId={}, query={}", appId, request.getQuery());
        // 关闭Nginx缓存，直接推流
        response.setHeader("Cache-Control", "no-cache");
        response.setHeader("X-Accel-Buffering", "no");
        // 获取API密钥
        String apiKey = difyAppService.getApiKeyById(appId);

        // 创建SSE发射器，超时时间设置为10分钟
        SseEmitter sseEmitter = new SseEmitter(5 * 60 * 1000L);


        /*SseEmitter emitter = new SseEmitter();
        try {
            emitter.send(SseEmitter.event().data("1Hello at " + System.currentTimeMillis()));
            log.info("已发送1");
            Thread.sleep(5000);
            emitter.send(SseEmitter.event().data("2Hello at " + System.currentTimeMillis()));
            log.info("已发送2");
            Thread.sleep(5000);
            emitter.send(SseEmitter.event().data("3Hello at " + System.currentTimeMillis()));
            log.info("已发送3");
            Thread.sleep(5000);
            emitter.send(SseEmitter.event().data("4Hello at " + System.currentTimeMillis()));
            log.info("已发送4");
            Thread.sleep(5000);
            emitter.send(SseEmitter.event().data("5Hello at " + System.currentTimeMillis()));
            log.info("已发送5");
            Thread.sleep(5000);
            emitter.send(SseEmitter.event().data("6Hello at " + System.currentTimeMillis()));
            log.info("已发送6");
            Thread.sleep(5000);
        }catch (Exception e){}

        emitter.complete();

        return emitter;*/
/*        String file = "{\"type\":\"document\",\"transfer_method\":\"local_file\",\"url\":\"\",\"upload_file_id\":\"39d250ab-d7a0-49ce-a53f-6671b519a409\"}}";
        JSONObject jsonObject = new JSONObject(file);*/
        try {
            // 调用Service处理请求并发送流式响应
            difyService.sendChatMessageStream(
                    request.getQuery(),
                    request.getInputs(),
                    request.getUser(),
                    request.getConversationId(),
                    request.getFiles(),
                    request.getAutoGenerateName(),
                    apiKey,
                    sseEmitter);
/*            difyService.sendChatMessageStream(
                    "国际近10年WEEE的研究热点主要是什么?",
                    Map.of("paper1",jsonObject),
                    "test_user",
                    "13faa472-2491-4c07-b3c7-f8f581ec3a4e",
                    List.of(),
                    false,
                    apiKey,
                    sseEmitter);*/
/*            new Thread(() -> {
                try {
                    for (int i = 0; i < 10; i++) {
                        Thread.sleep(1000);
                        sseEmitter.send(SseEmitter.event().data("1Hello at " + i));
                    }
                    sseEmitter.complete();
                }catch (Exception exception) {
                    exception.printStackTrace();
                }
            }).start();*/
        } catch (Exception e) {
            log.error("处理聊天消息请求异常: {}", ExceptionUtil.stacktraceToString(e));
            sseEmitter.completeWithError(e);
        }

        log.info("sseEmitter 已返回");
        return sseEmitter;
    }

    /**
     * 阻塞式发送对话消息
     *
     * @param appId   应用ID
     * @param request 消息请求
     * @return 响应内容
     */
    @PostMapping("/chat-messages/block")
    public ResponseEntity<Map<String, Object>> sendChatMessageBlock(
            @RequestParam Long appId,
            @RequestBody DifyRequest.ChatMessageRequest request) {
        log.info("接收到阻塞式聊天消息请求: appId={}, query={}", appId, request.getQuery());

        // 获取API密钥
        String apiKey = difyAppService.getApiKeyById(appId);

        try {
            // 调用Service处理请求并返回响应
            Map<String, Object> response = difyService.sendChatMessageBlock(
                    request.getQuery(),
                    request.getInputs(),
                    request.getUser(),
                    request.getConversationId(),
                    request.getFiles(),
                    request.getAutoGenerateName(),
                    apiKey);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("处理阻塞式聊天消息请求异常: {}", ExceptionUtil.stacktraceToString(e));
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 上传文件
     *
     * @param appId 应用ID
     * @param file  文件
     * @param user  用户标识
     * @return 上传结果
     */
    @PostMapping("/files/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @RequestParam Long appId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("user") String user) throws IOException {
        String apiKey = difyAppService.getApiKeyById(appId);
        Map<String, Object> response = difyService.uploadFile(file.getBytes(), file.getOriginalFilename(),
                file.getContentType(), user, apiKey);
        return ResponseEntity.ok(response);
    }

    /**
     * 停止响应
     *
     * @param appId   应用ID
     * @param taskId  任务ID
     * @param request 请求
     * @return 停止结果
     */
    @PostMapping("/chat-messages/{taskId}/stop")
    public ResponseEntity<Map<String, Object>> stopResponse(
            @RequestParam Long appId,
            @PathVariable String taskId,
            @RequestBody DifyRequest.StopResponseRequest request) {
        String apiKey = difyAppService.getApiKeyById(appId);
        Map<String, Object> response = difyService.stopResponse(taskId, request.getUser(), apiKey);
        return ResponseEntity.ok(response);
    }

    /**
     * 消息反馈
     *
     * @param appId     应用ID
     * @param messageId 消息ID
     * @param request   反馈请求
     * @return 反馈结果
     */
    @PostMapping("/messages/{messageId}/feedbacks")
    public ResponseEntity<Map<String, Object>> messageFeedback(
            @RequestParam Long appId,
            @PathVariable String messageId,
            @RequestBody DifyRequest.MessageFeedbackRequest request) {
        String apiKey = difyAppService.getApiKeyById(appId);
        Map<String, Object> response = difyService.messageFeedback(messageId, request.getRating(),
                request.getUser(), request.getContent(), apiKey);
        return ResponseEntity.ok(response);
    }

    /**
     * 获取下一轮建议问题列表
     *
     * @param appId     应用ID
     * @param messageId 消息ID
     * @param user      用户标识
     * @return 问题列表
     */
    @GetMapping("/messages/{messageId}/suggested")
    public ResponseEntity<List<String>> getSuggestedQuestions(
            @RequestParam Long appId,
            @PathVariable String messageId,
            @RequestParam String user) {
        // 获取应用详情，检查是否启用了回答后建议问题功能
        DifyApp difyApp = difyAppService.getById(appId);
        
        // 如果没有启用回答后建议问题功能，直接返回空列表
        if (difyApp == null || difyApp.getSuggestAfterAnswer() == null || !difyApp.getSuggestAfterAnswer()) {
            return ResponseEntity.ok(new ArrayList<>());
        }
        // 如果启用了回答后建议问题功能，则调用服务获取建议问题
        List<String> response = difyService.getSuggestedQuestions(messageId, user, difyApp.getApiKey());
        return ResponseEntity.ok(response);
    }

    /**
     * 获取会话历史消息
     *
     * @param appId          应用ID
     * @param conversationId 会话ID
     * @param user           用户标识
     * @param firstId        当前页第一条聊天记录的ID
     * @param limit          返回条数
     * @return 历史消息列表
     */
    @GetMapping("/messages")
    public ResponseEntity<Map<String, Object>> getMessageHistory(
            @RequestParam Long appId,
            @RequestParam String conversationId,
            @RequestParam String user,
            @RequestParam(required = false) String firstId,
            @RequestParam(required = false) Integer limit) {
        String apiKey = difyAppService.getApiKeyById(appId);
        Map<String, Object> response = difyService.getMessageHistory(conversationId, user, firstId, limit, apiKey);
        return ResponseEntity.ok(response);
    }

    /**
     * 获取会话列表
     *
     * @param appId  应用ID
     * @param user   用户标识
     * @param lastId 当前页最后一条记录的ID
     * @param limit  返回条数
     * @param sortBy 排序字段
     * @return 会话列表
     */
    @GetMapping("/conversations")
    public ResponseEntity<Map<String, Object>> getConversations(
            @RequestParam Long appId,
            @RequestParam String user,
            @RequestParam(required = false) String lastId,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) String sortBy) {
        String apiKey = difyAppService.getApiKeyById(appId);
        Map<String, Object> response = difyService.getConversations(user, lastId, limit, sortBy, apiKey);
        return ResponseEntity.ok(response);
    }

    /**
     * 删除会话
     *
     * @param appId          应用ID
     * @param conversationId 会话ID
     * @param request        请求
     * @return 删除结果
     */
    @DeleteMapping("/conversations/{conversationId}")
    public ResponseEntity<Map<String, Object>> deleteConversation(
            @RequestParam Long appId,
            @PathVariable String conversationId,
            @RequestBody Map<String, String> request) {
        String apiKey = difyAppService.getApiKeyById(appId);
        Map<String, Object> response = difyService.deleteConversation(conversationId, request.get("user"), apiKey);
        return ResponseEntity.ok(response);
    }

    /**
     * 会话重命名
     *
     * @param appId          应用ID
     * @param conversationId 会话ID
     * @param request        重命名请求
     * @return 重命名结果
     */
    @PostMapping("/conversations/{conversationId}/name")
    public ResponseEntity<Map<String, Object>> renameConversation(
            @RequestParam Long appId,
            @PathVariable String conversationId,
            @RequestBody DifyRequest.RenameConversationRequest request) {
        String apiKey = difyAppService.getApiKeyById(appId);
        Map<String, Object> response = difyService.renameConversation(conversationId, request.getName(),
                request.getAutoGenerate(), request.getUser(), apiKey);
        return ResponseEntity.ok(response);
    }

    /**
     * 语音转文字
     *
     * @param appId 应用ID
     * @param file  音频文件
     * @param user  用户标识
     * @return 转换结果
     */
    @PostMapping("/audio-to-text")
    public ResponseEntity<Map<String, Object>> audioToText(
            @RequestParam Long appId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("user") String user) throws IOException {
        String apiKey = difyAppService.getApiKeyById(appId);
        Map<String, Object> response = difyService.audioToText(file.getBytes(), file.getOriginalFilename(), user,
                apiKey);
        return ResponseEntity.ok(response);
    }

    /**
     * 文字转语音
     *
     * @param appId   应用ID
     * @param request 转换请求
     * @return 转换结果(音频数据)
     */
    @PostMapping(value = "/text-to-audio", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> textToAudio(
            @RequestParam Long appId,
            @RequestBody DifyRequest.TextToAudioRequest request) {
        String apiKey = difyAppService.getApiKeyById(appId);
        byte[] audioData = difyService.textToAudio(request.getMessageId(), request.getText(), request.getUser(),
                apiKey);
        return ResponseEntity.ok().header("Content-Type", "audio/wav").body(audioData);
    }

    /**
     * 获取应用基本信息
     *
     * @param appId 应用ID
     * @return 应用信息
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getAppInfo(@RequestParam Long appId) {
        String apiKey = difyAppService.getApiKeyById(appId);
        Map<String, Object> response = difyService.getAppInfo(apiKey);
        return ResponseEntity.ok(response);
    }

    /**
     * 获取应用参数
     *
     * @param appId 应用ID
     * @return 应用参数
     */
    @GetMapping("/parameters")
    public ResponseEntity<Map<String, Object>> getParameters(@RequestParam Long appId) {
        String apiKey = difyAppService.getApiKeyById(appId);
        Map<String, Object> response = difyService.getParameters(apiKey);
        return ResponseEntity.ok(response);
    }

    /**
     * 获取应用Meta信息
     *
     * @param appId 应用ID
     * @return Meta信息
     */
    @GetMapping("/meta")
    public ResponseEntity<Map<String, Object>> getMetaInfo(@RequestParam Long appId) {
        String apiKey = difyAppService.getApiKeyById(appId);
        Map<String, Object> response = difyService.getMetaInfo(apiKey);
        return ResponseEntity.ok(response);
    }

}
