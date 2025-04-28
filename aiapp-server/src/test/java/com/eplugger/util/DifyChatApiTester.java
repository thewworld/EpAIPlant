package com.eplugger.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Flux;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/**
 * Dify聊天API测试工具类
 * 用于手动测试Dify API的/chat-messages接口
 * 支持流式和阻塞式响应测试
 */
public class DifyChatApiTester {

    private static final Logger logger = LoggerFactory.getLogger(DifyChatApiTester.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private final String baseUrl;
    private final String apiKey;
    private final RestTemplate restTemplate;
    private final WebClient webClient;

    /**
     * 构造函数
     *
     * @param baseUrl Dify API基础URL (例如: http://localhost:8080/api/dify 或 外部URL)
     * @param apiKey  应用API密钥
     */
    public DifyChatApiTester(String baseUrl, String apiKey) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;

        // 配置超时
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000); // 10秒连接超时
        factory.setReadTimeout(60000);    // 60秒读取超时
        this.restTemplate = new RestTemplate(factory);

        // 初始化WebClient
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * 测试流式聊天消息API
     *
     * @param query            用户问题
     * @param conversationId   会话ID (可选)
     * @param user             用户标识
     * @param inputs           输入参数 (可选)
     * @param autoGenerateName 是否自动生成会话名称
     */
    public void testStreamChatMessage(String query, String conversationId, String user,
                                     Map<String, Object> inputs, boolean autoGenerateName) {
        logger.info("开始测试流式聊天消息API...");
        logger.info("请求参数: query={}, conversationId={}, user={}", query, conversationId, user);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("query", query);
        requestBody.put("user", user);
        requestBody.put("inputs", inputs != null ? inputs : new HashMap<>());
        
        if (conversationId != null && !conversationId.isEmpty()) {
            requestBody.put("conversation_id", conversationId);
        }
        
        requestBody.put("auto_generate_name", autoGenerateName);

        try {
            String json = objectMapper.writeValueAsString(requestBody);
            logger.info("请求体: {}", json);

            CountDownLatch latch = new CountDownLatch(1);

            logger.info("发送请求到: {}/chat-messages", baseUrl);
            
            webClient.post()
                    .uri("/chat-messages")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.TEXT_EVENT_STREAM)
                    .body(BodyInserters.fromValue(json))
                    .retrieve()
                    .bodyToFlux(String.class)
                    .doOnNext(chunk -> {
                        logger.info("收到数据块: {}", chunk);
                    })
                    .doOnComplete(() -> {
                        logger.info("流式响应完成");
                        latch.countDown();
                    })
                    .doOnError(error -> {
                        logger.error("流式请求出错: {}", error.getMessage(), error);
                        latch.countDown();
                    })
                    .subscribe();

            try {
                // 等待最多3分钟
                latch.await(3, TimeUnit.MINUTES);
            } catch (InterruptedException e) {
                logger.error("等待响应时被中断", e);
                Thread.currentThread().interrupt();
            }
        } catch (JsonProcessingException e) {
            logger.error("请求体序列化失败", e);
        }
    }

    /**
     * 测试阻塞式聊天消息API
     *
     * @param query            用户问题
     * @param conversationId   会话ID (可选)
     * @param user             用户标识
     * @param inputs           输入参数 (可选)
     * @param autoGenerateName 是否自动生成会话名称
     * @return 响应结果
     */
    public Map<String, Object> testBlockChatMessage(String query, String conversationId, String user,
                                                   Map<String, Object> inputs, boolean autoGenerateName) {
        logger.info("开始测试阻塞式聊天消息API...");
        logger.info("请求参数: query={}, conversationId={}, user={}", query, conversationId, user);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("query", query);
        requestBody.put("user", user);
        requestBody.put("inputs", inputs != null ? inputs : new HashMap<>());
        requestBody.put("response_mode", "blocking");
        
        if (conversationId != null && !conversationId.isEmpty()) {
            requestBody.put("conversation_id", conversationId);
        }
        
        requestBody.put("auto_generate_name", autoGenerateName);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
        
        String url = baseUrl + "/chat-messages/block";
        logger.info("发送请求到: {}", url);
        
        try {
            ResponseEntity<Map> responseEntity = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );
            
            logger.info("响应状态码: {}", responseEntity.getStatusCode());
            Map<String, Object> responseBody = responseEntity.getBody();
            logger.info("响应内容: {}", responseBody);
            
            return responseBody;
        } catch (Exception e) {
            logger.error("阻塞式请求出错: {}", e.getMessage(), e);
            return Map.of("error", e.getMessage());
        }
    }

    /**
     * 上传文件
     *
     * @param file 文件对象
     * @param user 用户标识
     * @return 上传结果
     */
    public Map<String, Object> uploadFile(File file, String user) {
        logger.info("开始上传文件: {}, user={}", file.getName(), user);
        
        if (!file.exists()) {
            logger.error("文件不存在: {}", file.getAbsolutePath());
            return Map.of("error", "File not found: " + file.getAbsolutePath());
        }
        
        try {
            // 创建多部分表单数据
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new FileSystemResource(file));
            body.add("user", user);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.set("Authorization", "Bearer " + apiKey);
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            
            String url = baseUrl + "/files/upload";
            logger.info("发送上传请求到: {}", url);
            
            ResponseEntity<Map> responseEntity = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );
            
            logger.info("上传响应状态码: {}", responseEntity.getStatusCode());
            Map<String, Object> responseBody = responseEntity.getBody();
            logger.info("上传响应内容: {}", responseBody);
            
            return responseBody;
        } catch (Exception e) {
            logger.error("文件上传出错: {}", e.getMessage(), e);
            return Map.of("error", e.getMessage());
        }
    }

    /**
     * 测试带文件的聊天消息
     *
     * @param query          用户问题
     * @param user           用户标识
     * @param filePath       文件路径
     * @param conversationId 会话ID (可选)
     * @return 聊天响应
     */
    public Map<String, Object> testChatWithFile(String query, String user, String filePath, String conversationId) {
        logger.info("开始测试带文件的聊天消息...");
        
        // 1. 上传文件
        File file = new File(filePath);
        Map<String, Object> uploadResult = uploadFile(file, user);
        
        if (uploadResult.containsKey("error")) {
            return uploadResult;
        }
        
        // 2. 构建文件参数
        String fileId = (String) ((Map<String, Object>) uploadResult.get("file")).get("id");
        
        List<Map<String, Object>> files = new ArrayList<>();
        Map<String, Object> fileInfo = new HashMap<>();
        fileInfo.put("type", "document"); // 根据文件类型可能需要调整
        fileInfo.put("transfer_method", "local_file");
        fileInfo.put("upload_file_id", fileId);
        files.add(fileInfo);
        
        // 3. 发送聊天请求
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("query", query);
        requestBody.put("user", user);
        requestBody.put("files", files);
        requestBody.put("response_mode", "blocking");
        
        if (conversationId != null && !conversationId.isEmpty()) {
            requestBody.put("conversation_id", conversationId);
        }
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
        
        String url = baseUrl + "/chat-messages/block";
        logger.info("发送带文件的聊天请求到: {}", url);
        
        try {
            ResponseEntity<Map> responseEntity = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );
            
            logger.info("响应状态码: {}", responseEntity.getStatusCode());
            Map<String, Object> responseBody = responseEntity.getBody();
            logger.info("带文件聊天响应: {}", responseBody);
            
            return responseBody;
        } catch (Exception e) {
            logger.error("带文件聊天请求出错: {}", e.getMessage(), e);
            return Map.of("error", e.getMessage());
        }
    }

    /**
     * 主方法，用于直接测试
     */
    public static void main(String[] args) {
        // 配置信息 - 在实际使用时请修改这些参数
        String baseUrl = "http://localhost:8080/api/dify";
        String apiKey = "your_api_key_here";
        Long appId = 1L;  // 应用ID
        
        // 构建完整的URL，包含appId
        String fullUrl = UriComponentsBuilder.fromUriString(baseUrl)
                .queryParam("appId", appId)
                .toUriString();
        
        DifyChatApiTester tester = new DifyChatApiTester(fullUrl, apiKey);
        
        // 测试参数
        String query = "这是一个测试问题，请回答";
        String user = "test_user_" + System.currentTimeMillis();
        
        // 测试流式响应
        tester.testStreamChatMessage(query, null, user, null, true);
        
        // 等待一段时间，确保流式响应完成
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
            Thread.currentThread().interrupt();
        }
        
        // 测试阻塞式响应
        Map<String, Object> blockResponse = tester.testBlockChatMessage(
                "这是一个阻塞式测试问题，请回答", null, user, null, true);
        
        // 获取会话ID，用于后续测试
        String conversationId = (String) blockResponse.get("conversation_id");
        logger.info("获取到会话ID: {}", conversationId);
        
        // 使用相同会话ID继续对话
        if (conversationId != null) {
            tester.testBlockChatMessage(
                    "请继续我们的对话", conversationId, user, null, false);
        }
        
        // 测试带输入参数的对话
        Map<String, Object> inputs = new HashMap<>();
        inputs.put("name", "测试用户");
        inputs.put("age", 30);
        
        tester.testBlockChatMessage(
                "我的名字和年龄是什么？", null, user, inputs, true);
    }
} 