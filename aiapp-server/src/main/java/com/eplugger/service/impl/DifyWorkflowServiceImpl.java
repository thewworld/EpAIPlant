package com.eplugger.service.impl;

import cn.hutool.core.collection.CollectionUtil;
import com.eplugger.service.DifyWorkflowService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResponseExtractor;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Dify Workflow服务实现类
 * 
 * @author jishuangjiang
 * @date 2025/3/25 10:00:00
 */
@Service
public class DifyWorkflowServiceImpl implements DifyWorkflowService {

    private static final Logger logger = LoggerFactory.getLogger(DifyWorkflowServiceImpl.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ExecutorService executorService;

    @Value("${dify.api.base-url}")
    private String baseUrl;

    public DifyWorkflowServiceImpl(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.executorService = Executors.newCachedThreadPool();
    }

    /**
     * 获取请求头
     */
    private HttpHeaders getHeaders(String apiKey) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    @Override
    public void workflowRun(Map<String, Object> inputs,
            String responseMode,
            String user,
            String apiKey,
            SseEmitter sseEmitter) {
        executorService.execute(() -> {
            try {
                String url = baseUrl + "/workflows/run";

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("inputs", inputs != null ? inputs : new HashMap<>());
                requestBody.put("response_mode", "streaming"); // streaming 或 blocking
                requestBody.put("user", user);

                HttpEntity<String> requestEntity = new HttpEntity<>(
                        objectMapper.writeValueAsString(requestBody),
                        getHeaders(apiKey));

                restTemplate.execute(url, HttpMethod.POST, req -> {
                    req.getHeaders().putAll(requestEntity.getHeaders());
                    req.getHeaders().setContentType(MediaType.APPLICATION_JSON);
                    req.getBody().write(objectMapper.writeValueAsString(requestBody).getBytes());
                }, new WorkflowStreamResponseExtractor(sseEmitter));

            } catch (Exception e) {
                logger.error("执行工作流失败", e);
                try {
                    Map<String, Object> error = new HashMap<>();
                    error.put("error", e.getMessage());
                    sseEmitter.send(SseEmitter.event().name("error").data(error));
                    sseEmitter.complete();
                } catch (IOException ioException) {
                    logger.error("发送SSE错误事件失败", ioException);
                }
            }
        });
    }

    @Override
    public Map<String, Object> workflowRunBlock(Map<String, Object> inputs,
            String user,
            String apiKey) {
        try {
            String url = baseUrl + "/workflows/run";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("inputs", inputs != null ? inputs : new HashMap<>());
            requestBody.put("response_mode", "blocking"); // 阻塞式响应
            requestBody.put("user", user);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, getHeaders(apiKey));
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, Map.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("执行工作流失败: " + response.getStatusCode());
            }

            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("error")) {
                throw new RuntimeException("执行工作流失败: " + responseBody.get("error"));
            }

            return responseBody;
        } catch (Exception e) {
            logger.error("执行工作流失败", e);
            Map<String, Object> errorResponse = new HashMap<>();

            // 根据不同错误类型设置对应的错误信息
            if (e.getMessage().contains("invalid_param")) {
                errorResponse.put("error", "传入参数异常");
                errorResponse.put("error_code", "invalid_param");
            } else if (e.getMessage().contains("app_unavailable")) {
                errorResponse.put("error", "App 配置不可用");
                errorResponse.put("error_code", "app_unavailable");
            } else if (e.getMessage().contains("provider_not_initialize")) {
                errorResponse.put("error", "无可用模型凭据配置");
                errorResponse.put("error_code", "provider_not_initialize");
            } else if (e.getMessage().contains("provider_quota_exceeded")) {
                errorResponse.put("error", "模型调用额度不足");
                errorResponse.put("error_code", "provider_quota_exceeded");
            } else if (e.getMessage().contains("model_currently_not_support")) {
                errorResponse.put("error", "当前模型不可用");
                errorResponse.put("error_code", "model_currently_not_support");
            } else if (e.getMessage().contains("workflow_request_error")) {
                errorResponse.put("error", "workflow 执行失败");
                errorResponse.put("error_code", "workflow_request_error");
            } else {
                errorResponse.put("error", "服务内部异常");
                errorResponse.put("error_code", "internal_error");
            }

            return errorResponse;
        }
    }

    @Override
    public Map<String, Object> getMessageHistory(String conversationId, String user,
            String firstId, Integer limit, String apiKey) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(baseUrl + "/workflow-messages")
                    .queryParam("conversation_id", conversationId)
                    .queryParam("user", user)
                    .queryParam("first_id", firstId)
                    .queryParam("limit", limit)
                    .toUriString();

            HttpEntity<String> requestEntity = new HttpEntity<>(getHeaders(apiKey));
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, String.class);

            return objectMapper.readValue(response.getBody(), Map.class);
        } catch (Exception e) {
            logger.error("获取工作流消息历史失败", e);
            throw new RuntimeException("获取工作流消息历史失败: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getConversations(String user, String lastId,
            Integer limit, String sortBy, String apiKey) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(baseUrl + "/workflow-conversations")
                    .queryParam("user", user)
                    .queryParam("last_id", lastId)
                    .queryParam("limit", limit)
                    .queryParam("sort_by", sortBy)
                    .toUriString();

            HttpEntity<String> requestEntity = new HttpEntity<>(getHeaders(apiKey));
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, String.class);

            return objectMapper.readValue(response.getBody(), Map.class);
        } catch (Exception e) {
            logger.error("获取工作流会话列表失败", e);
            throw new RuntimeException("获取工作流会话列表失败: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> deleteConversation(String conversationId, String user, String apiKey) {
        try {
            String url = baseUrl + "/workflow-conversations/" + conversationId;

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("user", user);

            HttpEntity<String> requestEntity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody),
                    getHeaders(apiKey));
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.DELETE, requestEntity,
                    String.class);

            return objectMapper.readValue(response.getBody(), Map.class);
        } catch (Exception e) {
            logger.error("删除工作流会话失败", e);
            throw new RuntimeException("删除工作流会话失败: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> renameConversation(String conversationId, String name,
            Boolean autoGenerate, String user, String apiKey) {
        try {
            String url = baseUrl + "/workflow-conversations/" + conversationId + "/name";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("name", name);
            requestBody.put("auto_generate", autoGenerate);
            requestBody.put("user", user);

            HttpEntity<String> requestEntity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody),
                    getHeaders(apiKey));
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

            return objectMapper.readValue(response.getBody(), Map.class);
        } catch (Exception e) {
            logger.error("重命名工作流会话失败", e);
            throw new RuntimeException("重命名工作流会话失败: " + e.getMessage());
        }
    }

    /**
     * 处理工作流流式响应的ResponseExtractor
     */
    private class WorkflowStreamResponseExtractor implements ResponseExtractor<Void> {
        private final SseEmitter sseEmitter;

        public WorkflowStreamResponseExtractor(SseEmitter sseEmitter) {
            this.sseEmitter = sseEmitter;
        }

        @Override
        public Void extractData(ClientHttpResponse response) throws IOException {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(response.getBody()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.startsWith("data: ")) {
                        String eventData = line.substring(6).trim();
                        if ("[DONE]".equals(eventData)) {
                            sseEmitter.send(SseEmitter.event().name("done").data(""));
                            sseEmitter.complete();
                            break;
                        } else {
                            try {
                                Map<String, Object> eventMap = objectMapper.readValue(eventData, Map.class);
                                String event = (String) eventMap.get("event");

                                // 根据不同的事件类型处理
                                switch (event) {
                                    case "workflow_started":
                                    case "node_started":
                                    case "node_finished":
                                    case "workflow_finished":
                                    case "tts_message":
                                    case "tts_message_end":
                                    case "ping":
                                        sseEmitter.send(SseEmitter.event()
                                                .name(event)
                                                .data(eventMap));
                                        break;
                                    default:
                                        sseEmitter.send(SseEmitter.event().data(eventMap));
                                }

                                // 如果是工作流结束事件，结束SSE
                                if ("workflow_finished".equals(event)) {
                                    sseEmitter.complete();
                                }
                            } catch (Exception e) {
                                logger.error("处理工作流流式响应失败", e);
                                sseEmitter.send(SseEmitter.event().data(eventData));
                            }
                        }
                    }
                }
            } catch (Exception e) {
                logger.error("处理工作流流式响应失败", e);
                Map<String, Object> error = new HashMap<>();
                error.put("error", e.getMessage());
                sseEmitter.send(SseEmitter.event().name("error").data(error));
                sseEmitter.completeWithError(e);
            }
            return null;
        }
    }
}