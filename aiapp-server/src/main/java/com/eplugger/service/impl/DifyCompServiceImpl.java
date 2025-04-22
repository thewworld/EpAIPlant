package com.eplugger.service.impl;

import com.eplugger.service.DifyCompService;
import com.eplugger.service.StreamResponseCallback;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResponseExtractor;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class DifyCompServiceImpl implements DifyCompService {
    private static final Logger logger = LoggerFactory.getLogger(DifyCompServiceImpl.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ExecutorService executorService;

    @Value("${dify.api.base-url}")
    private String baseUrl;

    public DifyCompServiceImpl(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.executorService = Executors.newCachedThreadPool();
    }

    /**
     * 获取包含API密钥的请求头
     */
    private HttpHeaders getHeaders(String apiKey) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    @Override
    public void sendCompletionMessageStream(
            String query,
            Map<String, Object> inputs,
            String user,
            List<Map<String, Object>> files,
            String apiKey,
            SseEmitter sseEmitter) {

        logger.info("发送流式文本生成消息: query={}, user={}", query, user);

        // 在另一个线程中执行，避免阻塞
        executorService.execute(() -> {
            // 修正 URL 路径 - Dify API 的完成接口可能是这个路径
            String url = baseUrl + "/completion-messages";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("query", query);
            requestBody.put("inputs", inputs != null ? inputs : new HashMap<>());
            requestBody.put("user", user);
            requestBody.put("response_mode", "streaming"); // 确保设置为流式响应模式

            if (files != null && !files.isEmpty()) {
                requestBody.put("files", files);
            }

            try {
                String jsonBody = objectMapper.writeValueAsString(requestBody);
                HttpEntity<String> requestEntity = new HttpEntity<>(jsonBody, getHeaders(apiKey));

                logger.info("发送请求: URL={}, Body={}", url, jsonBody);

                // 使用ResponseExtractor处理流式响应
                restTemplate.execute(
                        url,
                        HttpMethod.POST,
                        req -> {
                            req.getHeaders().addAll(requestEntity.getHeaders());
                            req.getBody().write(jsonBody.getBytes());
                        },
                        new StreamResponseExtractor(sseEmitter));
            } catch (Exception e) {
                logger.error("发送流式文本生成消息失败: {}", e.getMessage(), e);
                try {
                    Map<String, Object> error = new HashMap<>();
                    error.put("error", e.getMessage());
                    sseEmitter.send(SseEmitter.event().name("error").data(error));
                    sseEmitter.completeWithError(e);
                } catch (IOException ex) {
                    logger.error("发送错误事件失败", ex);
                }
            }
        });
    }

    @Override
    public Map<String, Object> sendCompletionMessageBlock(String query,
            Map<String, Object> inputs,
            String user,
            List<Map<String, Object>> files,
            String apiKey) {
        logger.info("Sending blocking completion message: query={}, user={}", query, user);

        // 修正 URL 路径
        String url = baseUrl + "/completion-messages";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("query", query);
        requestBody.put("inputs", inputs != null ? inputs : new HashMap<>());
        requestBody.put("user", user);
        requestBody.put("response_mode", "blocking");

        if (files != null && !files.isEmpty()) {
            requestBody.put("files", files);
        }

        try {
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            HttpEntity<String> requestEntity = new HttpEntity<>(jsonBody, getHeaders(apiKey));

            logger.info("发送请求: URL={}, Body={}", url, jsonBody);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class);

            logger.info("Received response: {}", response.getBody());
            return response.getBody();
        } catch (Exception e) {
            logger.error("发送阻塞式文本生成消息失败: {}", e.getMessage(), e);
            throw new RuntimeException("发送文本生成消息失败", e);
        }
    }

    /**
     * 处理流式响应的ResponseExtractor
     */
    private class StreamResponseExtractor implements ResponseExtractor<Void> {
        private final SseEmitter sseEmitter;

        public StreamResponseExtractor(SseEmitter sseEmitter) {
            this.sseEmitter = sseEmitter;
        }

        @Override
        public Void extractData(ClientHttpResponse response) throws IOException {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(response.getBody()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    logger.info("Received stream event: {}", line);
                    if (line.startsWith("data: ")) {
                        String eventData = line.substring(6).trim();
                        if ("[DONE]".equals(eventData)) {
                            sseEmitter.send(SseEmitter.event().name("done").data(""));
                            sseEmitter.complete();
                            break;
                        } else {
                            try {
                                // 直接将原始数据发送给客户端
                                sseEmitter.send(SseEmitter.event().data(eventData));
                            } catch (Exception e) {
                                logger.error("处理流式响应失败", e);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                logger.error("处理流式响应失败", e);
                Map<String, Object> error = new HashMap<>();
                error.put("error", e.getMessage());
                sseEmitter.send(SseEmitter.event().name("error").data(error));
                sseEmitter.completeWithError(e);
            } finally {
                sseEmitter.complete();
            }
            return null;
        }
    }
}