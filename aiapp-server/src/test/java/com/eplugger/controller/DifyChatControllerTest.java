package com.eplugger.controller;

import com.eplugger.model.DifyRequest;
import com.eplugger.service.DifyAppService;
import com.eplugger.service.DifyChatService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test") // 使用测试环境配置
public class DifyChatControllerTest {

    @Mock
    private DifyChatService difyService;

    @Mock
    private DifyAppService difyAppService;

    @Autowired
    private DifyChatController controller;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testSendChatMessage_Success() {
        // 准备测试数据
        Long appId = 24L;
        String apiKey = "app-jCcXdAepmNbYB8BZre5TUl9H";
        DifyRequest.ChatMessageRequest request = new DifyRequest.ChatMessageRequest();
        request.setQuery("1+1=几");
        request.setInputs(new HashMap<>());
        request.setUser("test_user");
//        request.setConversationId("test_conversation_id");
        request.setFiles(new ArrayList<>());
        request.setAutoGenerateName(true);

        // 设置Mock行为
        when(difyAppService.getApiKeyById(appId)).thenReturn(apiKey);
        ArgumentCaptor<SseEmitter> emitterCaptor = ArgumentCaptor.forClass(SseEmitter.class);
        doNothing().when(difyService).sendChatMessageStream(
                anyString(), anyMap(), anyString(), anyString(),
                anyList(), anyBoolean(), anyString(), emitterCaptor.capture()
        );

        MockHttpServletResponse response = new MockHttpServletResponse();
        // 执行测试
        SseEmitter result = controller.sendChatMessage(appId, request, response);
        // 验证并打印捕获到的SseEmitter
        SseEmitter capturedEmitter = emitterCaptor.getValue();
        System.out.println("Captured SseEmitter: " + capturedEmitter);

    }

    @Test
    public void testSendChatMessage_WithFiles() {
        // 准备测试数据
        Long appId = 1L;
        String apiKey = "test_api_key";
        DifyRequest.ChatMessageRequest request = new DifyRequest.ChatMessageRequest();
        request.setQuery("带文件的测试问题");
        request.setInputs(new HashMap<>());
        request.setUser("test_user");
        
        // 构造文件列表
        List<Map<String, Object>> files = new ArrayList<>();
        Map<String, Object> file = new HashMap<>();
        file.put("type", "document");
        file.put("transfer_method", "local_file");
        file.put("upload_file_id", "test-file-id");
        files.add(file);
        request.setFiles(files);
        
        MockHttpServletResponse response = new MockHttpServletResponse();
        
        // 设置Mock行为
        when(difyAppService.getApiKeyById(appId)).thenReturn(apiKey);
        doNothing().when(difyService).sendChatMessageStream(
                anyString(), anyMap(), anyString(), anyString(), 
                anyList(), anyBoolean(), anyString(), any(SseEmitter.class)
        );

        // 执行测试
        SseEmitter result = controller.sendChatMessage(appId, request, response);

        // 验证结果
        assertNotNull(result);
        verify(difyService, times(1)).sendChatMessageStream(
                eq(request.getQuery()),
                eq(request.getInputs()),
                eq(request.getUser()),
                eq(request.getConversationId()),
                eq(files),
                eq(request.getAutoGenerateName()),
                eq(apiKey),
                any(SseEmitter.class)
        );
    }

    @Test
    public void testSendChatMessage_WithInputs() {
        // 准备测试数据
        Long appId = 1L;
        String apiKey = "test_api_key";
        DifyRequest.ChatMessageRequest request = new DifyRequest.ChatMessageRequest();
        request.setQuery("带参数的测试问题");
        
        // 构造输入参数
        Map<String, Object> inputs = new HashMap<>();
        inputs.put("param1", "value1");
        inputs.put("param2", 123);
        request.setInputs(inputs);
        
        request.setUser("test_user");
        request.setFiles(new ArrayList<>());
        
        MockHttpServletResponse response = new MockHttpServletResponse();
        
        // 设置Mock行为
        when(difyAppService.getApiKeyById(appId)).thenReturn(apiKey);

        // 执行测试
        SseEmitter result = controller.sendChatMessage(appId, request, response);

        // 验证结果
        assertNotNull(result);
        verify(difyService, times(1)).sendChatMessageStream(
                eq(request.getQuery()),
                eq(inputs),
                eq(request.getUser()),
                eq(request.getConversationId()),
                eq(request.getFiles()),
                eq(request.getAutoGenerateName()),
                eq(apiKey),
                any(SseEmitter.class)
        );
    }

    @Test
    public void testSendChatMessage_ExceptionHandling() {
        // 准备测试数据
        Long appId = 1L;
        DifyRequest.ChatMessageRequest request = new DifyRequest.ChatMessageRequest();
        request.setQuery("测试异常处理");
        request.setUser("test_user");
        
        MockHttpServletResponse response = new MockHttpServletResponse();
        
        // 设置Mock行为 - 模拟异常情况
        when(difyAppService.getApiKeyById(appId)).thenReturn("test_api_key");
        doThrow(new RuntimeException("测试异常")).when(difyService).sendChatMessageStream(
                anyString(), anyMap(), anyString(), anyString(), 
                anyList(), anyBoolean(), anyString(), any(SseEmitter.class)
        );

        // 执行测试
        SseEmitter result = controller.sendChatMessage(appId, request, response);

        // 验证结果
        assertNotNull(result);
        verify(difyService, times(1)).sendChatMessageStream(
                anyString(), anyMap(), anyString(), anyString(), 
                anyList(), anyBoolean(), anyString(), any(SseEmitter.class)
        );
        // 注意：由于异常是在方法内部捕获并处理的，因此emitter.completeWithError()无法直接验证
    }
    
    @Test
    public void testSendChatMessageBlock_Success() {
        // 准备测试数据
        // 准备测试数据
        Long appId = 24L;
        String apiKey = "app-jCcXdAepmNbYB8BZre5TUl9H";
        DifyRequest.ChatMessageRequest request = new DifyRequest.ChatMessageRequest();
        request.setQuery("1+1=?");
        request.setInputs(new HashMap<>());
        request.setUser("test_user");
//        request.setConversationId("test_conversation_id");
        request.setFiles(new ArrayList<>());
        request.setAutoGenerateName(true);
        // 执行测试
        ResponseEntity<Map<String, Object>> result = controller.sendChatMessageBlock(appId, request);
        // 验证结果
    }
    
    @Test
    public void testSendChatMessageBlock_WithInputsAndFiles() {
        // 准备测试数据
        Long appId = 1L;
        String apiKey = "test_api_key";
        DifyRequest.ChatMessageRequest request = new DifyRequest.ChatMessageRequest();
        request.setQuery("带参数和文件的阻塞式测试");
        
        // 构造输入参数
        Map<String, Object> inputs = new HashMap<>();
        inputs.put("param1", "value1");
        inputs.put("param2", 456);
        request.setInputs(inputs);
        
        // 构造文件列表
        List<Map<String, Object>> files = new ArrayList<>();
        Map<String, Object> file = new HashMap<>();
        file.put("type", "document");
        file.put("transfer_method", "local_file");
        file.put("upload_file_id", "test-file-id-block");
        files.add(file);
        request.setFiles(files);
        
        request.setUser("test_user");
        
        // 模拟返回结果
        Map<String, Object> mockResponse = new HashMap<>();
        mockResponse.put("id", "msg_9876543210");
        mockResponse.put("content", "这是带参数和文件的阻塞式测试回复");
        
        // 设置Mock行为
        when(difyAppService.getApiKeyById(appId)).thenReturn(apiKey);
        when(difyService.sendChatMessageBlock(
                anyString(), anyMap(), anyString(), anyString(), 
                anyList(), anyBoolean(), anyString()
        )).thenReturn(mockResponse);

        // 执行测试
        ResponseEntity<Map<String, Object>> result = controller.sendChatMessageBlock(appId, request);

        // 验证结果
        assertNotNull(result);
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(mockResponse, result.getBody());
        verify(difyService, times(1)).sendChatMessageBlock(
                eq(request.getQuery()),
                eq(inputs),
                eq(request.getUser()),
                eq(request.getConversationId()),
                eq(files),
                eq(request.getAutoGenerateName()),
                eq(apiKey)
        );
    }
    
    @Test
    public void testSendChatMessageBlock_ExceptionHandling() {
        // 准备测试数据
        Long appId = 1L;
        DifyRequest.ChatMessageRequest request = new DifyRequest.ChatMessageRequest();
        request.setQuery("阻塞式异常测试");
        request.setUser("test_user");
        
        // 设置Mock行为 - 模拟异常情况
        when(difyAppService.getApiKeyById(appId)).thenReturn("test_api_key");
        when(difyService.sendChatMessageBlock(
                anyString(), anyMap(), anyString(), anyString(), 
                anyList(), anyBoolean(), anyString()
        )).thenThrow(new RuntimeException("阻塞式测试异常"));

        // 执行测试
        ResponseEntity<Map<String, Object>> result = controller.sendChatMessageBlock(appId, request);

        // 验证结果
        assertNotNull(result);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, result.getStatusCode());
        verify(difyService, times(1)).sendChatMessageBlock(
                anyString(), anyMap(), anyString(), anyString(), 
                anyList(), anyBoolean(), anyString()
        );
    }
} 