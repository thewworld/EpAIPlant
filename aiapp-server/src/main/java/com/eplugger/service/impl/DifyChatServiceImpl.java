package com.eplugger.service.impl;

import cn.hutool.core.collection.CollectionUtil;
import com.eplugger.service.DifyChatService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * @author jishuangjiang
 * @date 2025/3/21 17:42:45
 */
@Service
public class DifyChatServiceImpl implements DifyChatService {

    private static final Logger logger = LoggerFactory.getLogger(DifyChatServiceImpl.class);

    private static final int CHAT_BLOCK_TIMEOUT = 1200000; // 1200秒超时时间

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ExecutorService executorService;
    private final WebClient.Builder webClientBuilder;

    private WebClient webClient;

    @Value("${dify.api.base-url}")
    private String configBaseUrl;

    @Value("${dify.api.timeout:120000}")
    private int apiTimeout;

    @Autowired
    public DifyChatServiceImpl(RestTemplate restTemplate, ObjectMapper objectMapper,
            WebClient.Builder webClientBuilder) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.executorService = Executors.newCachedThreadPool();
        this.webClientBuilder = webClientBuilder;

        logger.info("--- DifyChatServiceImpl Constructor finished ---");
    }

    @PostConstruct
    public void initializeWebClient() {
        logger.info("--- Initializing WebClient in @PostConstruct ---");
        logger.info("Using configBaseUrl from @Value: '{}'", this.configBaseUrl);

        if (this.configBaseUrl == null || this.configBaseUrl.isEmpty()) {
            logger.error(
                    "Dify API base URL (dify.api.base-url) is not configured or empty! WebClient might not work correctly.");
        }

        this.webClient = this.webClientBuilder.baseUrl(this.configBaseUrl)
                .build();
        logger.info("WebClient initialized successfully with base URL: '{}'", this.configBaseUrl);
        logger.info("-----------------------------------------------");
    }

    /**
     * 获取包含API密钥的请求头
     *
     * @param apiKey API密钥
     * @return HTTP请求头
     */
    private HttpHeaders getHeaders(String apiKey) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    /**
     * 获取多部分表单请求头
     *
     * @param apiKey API密钥
     * @return HTTP请求头
     */
    private HttpHeaders getMultipartHeaders(String apiKey) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        return headers;
    }

    @Override
    @Async
    public void sendChatMessageStream(String query, Map<String, Object> inputs, String user,
            String conversationId, List<Map<String, Object>> files,
            Boolean autoGenerateName, String apiKey, SseEmitter sseEmitter) {
        if (this.webClient == null) {
            logger.error("WebClient is not initialized. Cannot send streaming message.");
            sseEmitter.completeWithError(new IllegalStateException("WebClient not available. Check configuration."));
            return;
        }

        try {
            String url = configBaseUrl + "/chat-messages";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("query", query);
            requestBody.put("inputs", inputs != null ? inputs : new HashMap<>());
            requestBody.put("user", user);
            requestBody.put("response_mode", "streaming");

            if (conversationId != null && !conversationId.isEmpty()) {
                requestBody.put("conversation_id", conversationId);
            }
            if (files != null && !files.isEmpty()) {
                requestBody.put("files", files);
            }
            if (StringUtils.isBlank(conversationId) && autoGenerateName != null) {
                requestBody.put("auto_generate_name", autoGenerateName);
            } else if (StringUtils.isNotBlank(conversationId)) {
                requestBody.remove("auto_generate_name");
            }

            String jsonBody;
            try {
                jsonBody = objectMapper.writeValueAsString(requestBody);
            } catch (JsonProcessingException e) {
                logger.error("序列化请求体失败", e);
                try {
                    Map<String, Object> errorData = Map.of("event", "error", "error",
                            Map.of("message", "内部服务器错误：无法构建请求"));
                    sseEmitter.send(SseEmitter.event().data(errorData));
                } catch (IOException ioEx) {
                    logger.error("发送 SSE 错误事件失败", ioEx);
                }
                sseEmitter.completeWithError(e);
                return;
            }

            String targetUriPath = "/chat-messages";
            String intendedFullUrl = this.configBaseUrl != null ? this.configBaseUrl + targetUriPath
                    : "UNKNOWN_BASE_URL" + targetUriPath;
            logger.info("Attempting WebClient POST request to intended URL: '{}' with relative path: '{}'",
                    intendedFullUrl, targetUriPath);
            logger.debug("Sending streaming request body: {}", jsonBody);

            webClient.post()
                    .uri(targetUriPath)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.TEXT_EVENT_STREAM)
                    .bodyValue(jsonBody)
                    .retrieve()
                    .bodyToFlux(String.class)
                    .doOnError(error -> {
                        logger.error("WebClient 请求 Dify 失败 (URL: {}): {}", intendedFullUrl, error.getMessage(), error);
                        try {
                            Map<String, Object> errorData = Map.of("event", "error", "error",
                                    Map.of("message", "连接 Dify 服务失败: " + error.getMessage()));
                            sseEmitter.send(SseEmitter.event().data(errorData));
                        } catch (IOException ioEx) {
                            logger.error("发送 SSE 错误事件失败", ioEx);
                        }
                        sseEmitter.completeWithError(error);
                    })
                    .subscribe(
                            dataLine -> {
                                logger.debug("dataLine: {}", dataLine);
                                try {
                                    Map<String, Object> eventMap = objectMapper.readValue(dataLine,
                                            Map.class);
                                    sseEmitter.send(SseEmitter.event().data(eventMap));
                                } catch (IOException e) {
                                    logger.warn("无法将事件数据解析为JSON，忽略该行: {}", dataLine, e);
                                } catch (Exception e) {
                                    logger.error("处理SSE数据时发生意外错误", e);
                                    try {
                                        Map<String, Object> errorData = Map.of("event", "error",
                                                "error", Map.of("message", "处理响应数据时出错"));
                                        sseEmitter.send(SseEmitter.event().data(errorData));
                                    } catch (IOException sendEx) {
                                        logger.error("发送 SSE 错误事件失败", sendEx);
                                    }
                                }
                            },
                            error -> {
                                logger.error("SSE 流处理错误", error);
                                try {
                                    Map<String, Object> errorData = Map.of("event", "error", "error",
                                            Map.of("message", "处理 Dify 响应流时出错: " + error.getMessage()));
                                    sseEmitter.send(SseEmitter.event().data(errorData));
                                } catch (IOException ioEx) {
                                    logger.error("发送 SSE 错误事件失败", ioEx);
                                }
                                sseEmitter.completeWithError(error);
                            },
                            () -> {
                                logger.info("Dify 响应流处理完成 for {}", intendedFullUrl);
                                sseEmitter.complete();
                            });

            sseEmitter.onCompletion(() -> logger.info("SseEmitter completed (Completion Callback)."));
            sseEmitter.onTimeout(() -> {
                logger.warn("SseEmitter timed out.");
                sseEmitter.complete();
            });
            sseEmitter.onError(throwable -> logger.error("SseEmitter error (Error Callback)", throwable));

        } catch (Exception e) {
            logger.error("准备发送流式对话消息时失败", e);
            try {
                Map<String, Object> error = new HashMap<>();
                error.put("event", "error");
                error.put("error", Map.of("message", "服务器内部错误: " + e.getMessage()));
                sseEmitter.send(SseEmitter.event().data(error));
            } catch (IOException ioException) {
                logger.error("发送SSE错误事件失败", ioException);
            }
            sseEmitter.completeWithError(e);
        }
    }

    @Override
    public Map<String, Object> uploadFile(byte[] fileBytes, String fileName, String fileType, String user,
            String apiKey) {
        try {
            String url = configBaseUrl + "/files/upload";

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource fileResource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return fileName;
                }
            };

            body.add("file", fileResource);
            body.add("user", user);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body,
                    getMultipartHeaders(apiKey));
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

            return objectMapper.readValue(response.getBody(), Map.class);
        } catch (Exception e) {
            logger.error("上传文件失败", e);
            throw new RuntimeException("上传文件失败: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> stopResponse(String taskId, String user, String apiKey) {
        try {
            String url = configBaseUrl + "/chat-messages/" + taskId + "/stop";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("user", user);

            HttpEntity<String> requestEntity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody),
                    getHeaders(apiKey));
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

            return objectMapper.readValue(response.getBody(), Map.class);
        } catch (Exception e) {
            logger.error("停止响应失败", e);
            throw new RuntimeException("停止响应失败: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> messageFeedback(String messageId, String rating, String user, String content,
            String apiKey) {
        try {
            String url = configBaseUrl + "/messages/" + messageId + "/feedbacks";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("rating", rating);
            requestBody.put("user", user);

            if (content != null && !content.isEmpty()) {
                requestBody.put("content", content);
            }

            HttpEntity<String> requestEntity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody),
                    getHeaders(apiKey));
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

            return objectMapper.readValue(response.getBody(), Map.class);
        } catch (Exception e) {
            logger.error("消息反馈失败", e);
            throw new RuntimeException("消息反馈失败: " + e.getMessage());
        }
    }

    @Override
    public List<String> getSuggestedQuestions(String messageId, String user, String apiKey) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(configBaseUrl + "/messages/" + messageId + "/suggested")
                    .queryParam("user", user)
                    .toUriString();

            HttpEntity<String> requestEntity = new HttpEntity<>(getHeaders(apiKey));
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, String.class);

            Map<String, Object> responseMap = objectMapper.readValue(response.getBody(), Map.class);
            Object data = responseMap.get("data");
            if (data instanceof List) {
                try {
                    @SuppressWarnings("unchecked")
                    List<String> suggestions = (List<String>) data;
                    return suggestions;
                } catch (ClassCastException e) {
                    logger.error("获取建议问题返回的'data'列表包含非字符串元素", e);
                    return Collections.emptyList();
                }
            } else {
                logger.warn("获取建议问题返回的'data'字段不是列表或为空: {}", data);
                return Collections.emptyList();
            }
        } catch (Exception e) {
            logger.error("获取建议问题失败", e);
            return Collections.emptyList();
        }
    }

    @Override
    public Map<String, Object> getMessageHistory(String conversationId, String user, String firstId, Integer limit,
            String apiKey) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(configBaseUrl + "/messages")
                    .queryParam("conversation_id", conversationId)
                    .queryParam("user", user)
                    .queryParamIfPresent("first_id", java.util.Optional.ofNullable(firstId))
                    .queryParamIfPresent("limit", java.util.Optional.ofNullable(limit))
                    .toUriString();

            HttpEntity<String> requestEntity = new HttpEntity<>(getHeaders(apiKey));
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, String.class);

            return objectMapper.readValue(response.getBody(), Map.class);
        } catch (Exception e) {
            logger.error("获取消息历史失败", e);
            throw new RuntimeException("获取消息历史失败: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getConversations(String user, String lastId, Integer limit, String sortBy,
            String apiKey) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(configBaseUrl + "/conversations")
                    .queryParam("user", user)
                    .queryParamIfPresent("last_id", java.util.Optional.ofNullable(lastId))
                    .queryParamIfPresent("limit", java.util.Optional.ofNullable(limit))
                    .queryParamIfPresent("sort_by", java.util.Optional.ofNullable(sortBy))
                    .toUriString();

            HttpEntity<String> requestEntity = new HttpEntity<>(getHeaders(apiKey));
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, String.class);

            return objectMapper.readValue(response.getBody(), Map.class);
        } catch (Exception e) {
            logger.error("获取会话列表失败", e);
            throw new RuntimeException("获取会话列表失败: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> deleteConversation(String conversationId, String user, String apiKey) {
        try {
            String url = configBaseUrl + "/conversations/" + conversationId;

            HttpEntity<Void> requestEntity = new HttpEntity<>(getHeaders(apiKey));
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.DELETE, requestEntity,
                    String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return objectMapper.readValue(response.getBody(), Map.class);
            } else if (response.getStatusCode().is2xxSuccessful()) {
                return Map.of("success", true, "status", response.getStatusCodeValue());
            } else {
                throw new RuntimeException("删除会话失败，状态码: " + response.getStatusCode());
            }
        } catch (Exception e) {
            logger.error("删除会话失败", e);
            throw new RuntimeException("删除会话失败: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> renameConversation(String conversationId, String name, Boolean autoGenerate, String user,
            String apiKey) {
        try {
            String url = configBaseUrl + "/conversations/" + conversationId + "/name";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("name", name);
            if (name == null || name.isEmpty()) {
                requestBody.put("auto_generate", autoGenerate != null ? autoGenerate : true);
                requestBody.remove("name");
            } else if (autoGenerate != null) {
                // 如果 name 不为空，通常不应发送 auto_generate，或根据 Dify 行为调整
                // requestBody.put("auto_generate", autoGenerate); // 如果 Dify 允许同时设置...
            }
            requestBody.put("user", user);

            HttpEntity<String> requestEntity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody),
                    getHeaders(apiKey));
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

            return objectMapper.readValue(response.getBody(), Map.class);
        } catch (Exception e) {
            logger.error("重命名会话失败", e);
            throw new RuntimeException("重命名会话失败: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> audioToText(byte[] fileBytes, String fileName, String user, String apiKey) {
        try {
            String url = configBaseUrl + "/audio-to-text";

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource fileResource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return fileName;
                }
            };

            body.add("file", fileResource);
            body.add("user", user);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body,
                    getMultipartHeaders(apiKey));
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

            return objectMapper.readValue(response.getBody(), Map.class);
        } catch (Exception e) {
            logger.error("语音转文字失败", e);
            throw new RuntimeException("语音转文字失败: " + e.getMessage());
        }
    }

    @Override
    public byte[] textToAudio(String messageId, String text, String user, String apiKey) {
        try {
            String url = configBaseUrl + "/text-to-audio";

            Map<String, Object> requestBody = new HashMap<>();
            if (messageId != null)
                requestBody.put("message_id", messageId);
            if (text != null)
                requestBody.put("text", text);
            requestBody.put("user", user);

            HttpHeaders audioHeaders = getHeaders(apiKey);
            audioHeaders.setAccept(Collections.singletonList(MediaType.APPLICATION_OCTET_STREAM));
            HttpEntity<String> requestEntity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody),
                    audioHeaders);

            ResponseEntity<byte[]> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, byte[].class);
            return response.getBody();
        } catch (Exception e) {
            logger.error("文字转语音失败", e);
            throw new RuntimeException("文字转语音失败: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getAppInfo(String apiKey) {
        try {
            String url = configBaseUrl + "/info";

            HttpEntity<String> requestEntity = new HttpEntity<>(getHeaders(apiKey));
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, String.class);

            return objectMapper.readValue(response.getBody(), Map.class);
        } catch (Exception e) {
            logger.error("获取应用信息失败", e);
            throw new RuntimeException("获取应用信息失败: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getParameters(String apiKey) {
        try {
            String url = configBaseUrl + "/parameters";

            HttpEntity<String> requestEntity = new HttpEntity<>(getHeaders(apiKey));
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, String.class);

            return objectMapper.readValue(response.getBody(), Map.class);
        } catch (Exception e) {
            logger.error("获取应用参数失败", e);
            throw new RuntimeException("获取应用参数失败: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getMetaInfo(String apiKey) {
        logger.warn("getMetaInfo 方法被调用，但 Dify 通常没有此端点。可能意指 /parameters 或 /info。");
        return Map.of("status", "not implemented or deprecated");
    }

    @Override
    public Map<String, Object> sendChatMessageBlock(String query, Map<String, Object> inputs, String user,
            String conversationId, List<Map<String, Object>> files, Boolean autoGenerateName, String apiKey) {
        logger.info("Sending blocking chat message to {}/chat-messages: query={}, user={}, conversationId={}",
                configBaseUrl, query, user, conversationId);

        String url = configBaseUrl + "/chat-messages";
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("query", query);
        requestBody.put("inputs", inputs != null ? inputs : new HashMap<>());
        requestBody.put("user", user);
        requestBody.put("response_mode", "blocking");
        if (StringUtils.isNotBlank(conversationId)) {
            requestBody.put("conversation_id", conversationId);
        }
        if (CollectionUtil.isNotEmpty(files)) {
            requestBody.put("files", files);
        }
        if (StringUtils.isBlank(conversationId) && autoGenerateName != null) {
            requestBody.put("auto_generate_name", autoGenerateName);
        } else if (StringUtils.isNotBlank(conversationId)) {
            requestBody.remove("auto_generate_name");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        HttpEntity<String> requestEntity;
        try {
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            requestEntity = new HttpEntity<>(jsonBody, headers);
        } catch (Exception e) {
            logger.error("Error serializing request body to JSON", e);
            throw new RuntimeException("Error serializing request body to JSON", e);
        }
        try {
            SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
            requestFactory.setConnectTimeout(apiTimeout);
            requestFactory.setReadTimeout(apiTimeout);
            RestTemplate timeoutRestTemplate = new RestTemplate(requestFactory);
            ResponseEntity<Map> response = timeoutRestTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class);
            logger.info("Received blocking response status: {}", response.getStatusCode());
            return response.getBody();
        } catch (Exception e) {
            logger.error("发送阻塞式聊天消息失败 (URL: {}): {}", url, e.getMessage(), e);
            throw new RuntimeException("发送聊天消息失败: " + e.getMessage(), e);
        }
    }
}
