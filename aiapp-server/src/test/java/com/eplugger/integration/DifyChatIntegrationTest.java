package com.eplugger.integration;

import com.eplugger.model.DifyRequest;
import com.eplugger.service.DifyAppService;
import com.eplugger.service.DifyChatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Dify聊天API集成测试
 * 测试/chat-messages和/chat-messages/block接口的端到端功能
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test") // 使用测试配置文件
public class DifyChatIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DifyChatService difyService;

    @MockBean
    private DifyAppService difyAppService;

    // 测试数据
    private static final Long APP_ID = 1L;
    private static final String API_KEY = "test_api_key";
    private static final String USER_ID = "test_user";

    @BeforeEach
    public void setup() {
        // 设置通用的Mock行为
        when(difyAppService.getApiKeyById(APP_ID)).thenReturn(API_KEY);
    }

    /**
     * 测试阻塞式聊天API
     */
    @Test
    public void testChatMessagesBlock() throws Exception {
        // 准备请求数据
        DifyRequest.ChatMessageRequest request = new DifyRequest.ChatMessageRequest();
        request.setQuery("集成测试问题");
        request.setUser(USER_ID);
        request.setInputs(new HashMap<>());
        request.setFiles(new ArrayList<>());

        // 模拟服务响应
        Map<String, Object> serviceResponse = new HashMap<>();
        serviceResponse.put("id", "msg_12345");
        serviceResponse.put("answer", "这是集成测试的回答");
        serviceResponse.put("conversation_id", "conv_12345");

        when(difyService.sendChatMessageBlock(
                eq(request.getQuery()),
                anyMap(),
                eq(request.getUser()),
                anyString(),
                anyList(),
                anyBoolean(),
                eq(API_KEY)
        )).thenReturn(serviceResponse);

        // 执行测试请求
        MvcResult result = mockMvc.perform(post("/api/dify/chat-messages/block")
                        .param("appId", APP_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        // 验证响应
        String responseContent = result.getResponse().getContentAsString();
        Map<String, Object> responseMap = objectMapper.readValue(responseContent, Map.class);
        
        assertEquals(serviceResponse.get("id"), responseMap.get("id"));
        assertEquals(serviceResponse.get("answer"), responseMap.get("answer"));
        assertEquals(serviceResponse.get("conversation_id"), responseMap.get("conversation_id"));
        
        // 验证服务调用
        verify(difyAppService, times(1)).getApiKeyById(APP_ID);
        verify(difyService, times(1)).sendChatMessageBlock(
                anyString(), anyMap(), anyString(), anyString(), anyList(), anyBoolean(), anyString()
        );
    }

    /**
     * 测试流式聊天API (注意：流式API难以在集成测试中完全测试)
     */
    @Test
    public void testChatMessagesStream() throws Exception {
        // 准备请求数据
        DifyRequest.ChatMessageRequest request = new DifyRequest.ChatMessageRequest();
        request.setQuery("流式集成测试问题");
        request.setUser(USER_ID);
        request.setInputs(new HashMap<>());
        request.setFiles(new ArrayList<>());

        // 模拟服务行为 - 只能验证服务是否被调用，无法验证流式结果
        doAnswer(invocation -> {
            SseEmitter emitter = invocation.getArgument(7);
            // 模拟发送一些事件（这在集成测试中可能不会实际执行）
            try {
                emitter.send(SseEmitter.event().data("测试事件"));
            } catch (Exception e) {
                // 忽略错误
            }
            return null;
        }).when(difyService).sendChatMessageStream(
                anyString(), anyMap(), anyString(), anyString(), 
                anyList(), anyBoolean(), anyString(), any(SseEmitter.class)
        );

        // 执行测试请求 - 注意我们不会等待流式响应完成
        mockMvc.perform(post("/api/dify/chat-messages")
                        .param("appId", APP_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.header().string("Content-Type", "text/event-stream"))
                .andReturn();

        // 验证服务调用
        verify(difyAppService, times(1)).getApiKeyById(APP_ID);
        verify(difyService, times(1)).sendChatMessageStream(
                eq(request.getQuery()),
                eq(request.getInputs()),
                eq(request.getUser()),
                eq(request.getConversationId()),
                eq(request.getFiles()),
                eq(request.getAutoGenerateName()),
                eq(API_KEY),
                any(SseEmitter.class)
        );
    }

    /**
     * 测试带文件的聊天消息
     */
    @Test
    public void testChatMessagesWithFiles() throws Exception {
        // 准备请求数据
        DifyRequest.ChatMessageRequest request = new DifyRequest.ChatMessageRequest();
        request.setQuery("带文件的测试问题");
        request.setUser(USER_ID);
        
        // 准备文件数据
        List<Map<String, Object>> files = new ArrayList<>();
        Map<String, Object> file = new HashMap<>();
        file.put("type", "document");
        file.put("transfer_method", "local_file");
        file.put("upload_file_id", "test-file-id-integration");
        files.add(file);
        request.setFiles(files);

        // 模拟服务响应
        Map<String, Object> serviceResponse = new HashMap<>();
        serviceResponse.put("id", "msg_file_12345");
        serviceResponse.put("answer", "这是处理文件后的回答");
        
        when(difyService.sendChatMessageBlock(
                anyString(), anyMap(), anyString(), anyString(), 
                anyList(), anyBoolean(), anyString()
        )).thenReturn(serviceResponse);

        // 执行测试请求
        MvcResult result = mockMvc.perform(post("/api/dify/chat-messages/block")
                        .param("appId", APP_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        // 验证响应
        String responseContent = result.getResponse().getContentAsString();
        Map<String, Object> responseMap = objectMapper.readValue(responseContent, Map.class);
        
        assertEquals(serviceResponse.get("id"), responseMap.get("id"));
        assertEquals(serviceResponse.get("answer"), responseMap.get("answer"));
        
        // 验证服务调用
        verify(difyService, times(1)).sendChatMessageBlock(
                eq(request.getQuery()),
                eq(request.getInputs()),
                eq(request.getUser()),
                eq(request.getConversationId()),
                eq(files),
                eq(request.getAutoGenerateName()),
                eq(API_KEY)
        );
    }

    /**
     * 测试错误处理
     */
    @Test
    public void testChatMessagesBlock_ErrorHandling() throws Exception {
        // 准备请求数据
        DifyRequest.ChatMessageRequest request = new DifyRequest.ChatMessageRequest();
        request.setQuery("触发错误的问题");
        request.setUser(USER_ID);

        // 模拟服务抛出异常
        when(difyService.sendChatMessageBlock(
                anyString(), anyMap(), anyString(), anyString(), 
                anyList(), anyBoolean(), anyString()
        )).thenThrow(new RuntimeException("模拟的服务错误"));

        // 执行测试请求，预期返回500错误
        mockMvc.perform(post("/api/dify/chat-messages/block")
                        .param("appId", APP_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError())
                .andReturn();

        // 验证服务调用
        verify(difyService, times(1)).sendChatMessageBlock(
                anyString(), anyMap(), anyString(), anyString(), 
                anyList(), anyBoolean(), anyString()
        );
    }
} 