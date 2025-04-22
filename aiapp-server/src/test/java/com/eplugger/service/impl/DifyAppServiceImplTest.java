package com.eplugger.service.impl;

import com.eplugger.model.DifyAppInfo;
import com.eplugger.model.DifyAppMeta;
import com.eplugger.model.DifyParameters;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * DifyAppServiceImpl测试类
 *
 * @author jishuangjiang
 * @date 2025/3/26 15:00:00
 */
@ExtendWith(MockitoExtension.class)
public class DifyAppServiceImplTest {

    @Mock
    private RestTemplate restTemplate;
    
    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private DifyAppServiceImpl difyAppService;

    private final String apiKey = "test-api-key";
    private final String baseUrl = "http://test-dify-api.com/v1";

    @BeforeEach
    void setUp() {
        // 设置Dify API基础URL
        ReflectionTestUtils.setField(difyAppService, "difyBaseUrl", baseUrl);
    }

    /**
     * 测试获取应用参数
     */
    @Test
    void testGetParameters() {
        // 准备模拟响应数据
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("opening_statement", "欢迎使用我的应用");
        
        // 模拟表单配置
        List<Map<String, Object>> formControls = new ArrayList<>();
        Map<String, Object> textInput = new HashMap<>();
        textInput.put("label", "问题");
        textInput.put("variable", "question");
        textInput.put("required", true);
        textInput.put("max_length", 100);
        
        Map<String, Object> formItem = new HashMap<>();
        formItem.put("text-input", textInput);
        formControls.add(formItem);
        
        responseData.put("user_input_form", formControls);
        
        // 模拟文件上传配置
        Map<String, Object> imageConfig = new HashMap<>();
        imageConfig.put("enabled", true);
        imageConfig.put("number_limits", 3);
        imageConfig.put("transfer_methods", Arrays.asList("local_file", "remote_url"));
        
        Map<String, Object> fileUpload = new HashMap<>();
        fileUpload.put("image", imageConfig);
        fileUpload.put("enabled", true);
        fileUpload.put("allowed_file_types", Arrays.asList("image", "document"));
        fileUpload.put("number_limits", 2);
        
        responseData.put("file_upload", fileUpload);
        
        // 模拟敏感词过滤配置
        Map<String, Object> inputsConfig = new HashMap<>();
        inputsConfig.put("enabled", true);
        inputsConfig.put("preset_response", "我不能回答这个问题");
        
        Map<String, Object> outputsConfig = new HashMap<>();
        outputsConfig.put("enabled", true);
        outputsConfig.put("preset_response", "请换一种方式提问");
        
        Map<String, Object> sensitiveConfig = new HashMap<>();
        sensitiveConfig.put("inputs_config", inputsConfig);
        sensitiveConfig.put("outputs_config", outputsConfig);
        sensitiveConfig.put("keywords", "敏感词1,敏感词2");
        
        Map<String, Object> sensitiveWordAvoidance = new HashMap<>();
        sensitiveWordAvoidance.put("enabled", true);
        sensitiveWordAvoidance.put("type", "keywords");
        sensitiveWordAvoidance.put("config", sensitiveConfig);
        
        responseData.put("sensitive_word_avoidance", sensitiveWordAvoidance);
        
        // 模拟系统参数
        Map<String, Object> sysParams = new HashMap<>();
        sysParams.put("file_size_limit", 15);
        sysParams.put("image_file_size_limit", 10);
        sysParams.put("audio_file_size_limit", 50);
        sysParams.put("video_file_size_limit", 100);
        sysParams.put("workflow_file_upload_limit", 10);
        
        responseData.put("system_parameters", sysParams);

        // 模拟RestTemplate响应
        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseData, HttpStatus.OK);
        when(restTemplate.exchange(
                eq(baseUrl + "/parameters"),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(responseEntity);

        // 执行测试
        DifyParameters result = difyAppService.getParameters(apiKey);

        // 验证结果
        assertNotNull(result);
        assertEquals("欢迎使用我的应用", result.getOpeningStatement());
        assertNotNull(result.getUserInputForm());
        assertNotNull(result.getFileUpload());
        assertNotNull(result.getSystemParameters());
        
        // 验证文件上传配置
        DifyParameters.FileUpload fileUploadResult = result.getFileUpload();
        DifyParameters.ImageConfig imageConfigResult = fileUploadResult.getImage();
        assertTrue(imageConfigResult.isEnabled());
        assertEquals(3, imageConfigResult.getNumberLimits());
        assertTrue(fileUploadResult.isEnabled());
        assertEquals(2, fileUploadResult.getNumberLimits());
        
        // 验证敏感词过滤配置
        DifyParameters.SensitiveWordAvoidance sensitiveAvoidance = result.getSensitiveWordAvoidance();
        assertNotNull(sensitiveAvoidance);
        assertTrue(sensitiveAvoidance.isEnabled());
        assertEquals("keywords", sensitiveAvoidance.getType());
        
        DifyParameters.SensitiveWordConfig sensitiveConfig1 = sensitiveAvoidance.getConfig();
        assertNotNull(sensitiveConfig1);
        assertEquals("敏感词1,敏感词2", sensitiveConfig1.getKeywords());
        
        DifyParameters.SensitiveWordFilterConfig inputsConfig1 = sensitiveConfig1.getInputsConfig();
        assertTrue(inputsConfig1.isEnabled());
        assertEquals("我不能回答这个问题", inputsConfig1.getPresetResponse());
        
        DifyParameters.SensitiveWordFilterConfig outputsConfig1 = sensitiveConfig1.getOutputsConfig();
        assertTrue(outputsConfig1.isEnabled());
        assertEquals("请换一种方式提问", outputsConfig1.getPresetResponse());
        
        // 验证系统参数
        DifyParameters.SystemParameters sysParamsResult = result.getSystemParameters();
        assertEquals(15, sysParamsResult.getFileSizeLimit());
        assertEquals(10, sysParamsResult.getImageFileSizeLimit());
        assertEquals(50, sysParamsResult.getAudioFileSizeLimit());
        assertEquals(100, sysParamsResult.getVideoFileSizeLimit());
        assertEquals(10, sysParamsResult.getWorkflowFileUploadLimit());
    }

    /**
     * 测试获取应用基本信息
     */
    @Test
    void testGetAppInfo() {
        // 准备模拟响应数据
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("name", "测试应用");
        responseData.put("description", "这是一个用于测试的应用");
        responseData.put("tags", new String[]{"测试", "AI", "Dify"});

        // 模拟RestTemplate响应
        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseData, HttpStatus.OK);
        when(restTemplate.exchange(
                eq(baseUrl + "/info"),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(responseEntity);

        // 执行测试
        DifyAppInfo result = difyAppService.getAppInfo(apiKey);

        // 验证结果
        assertNotNull(result);
        assertEquals("测试应用", result.getName());
        assertEquals("这是一个用于测试的应用", result.getDescription());
        assertNotNull(result.getTags());
        assertEquals(3, result.getTags().size());
    }

    /**
     * 测试获取应用Meta信息
     */
    @Test
    void testGetAppMeta() {
        // 准备模拟响应数据
        Map<String, Object> toolIcon1 = new HashMap<>();
        toolIcon1.put("background", "#252525");
        toolIcon1.put("content", "😁");
        
        Map<String, Object> toolIcons = new HashMap<>();
        toolIcons.put("api_tool", toolIcon1);
        toolIcons.put("dalle2", "https://cloud.dify.ai/console/api/workspaces/current/tool-provider/builtin/dalle/icon");
        
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("tool_icons", toolIcons);

        // 模拟RestTemplate响应
        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseData, HttpStatus.OK);
        when(restTemplate.exchange(
                eq(baseUrl + "/meta"),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(responseEntity);

        // 执行测试
        DifyAppMeta result = difyAppService.getAppMeta(apiKey);

        // 验证结果
        assertNotNull(result);
        assertNotNull(result.getToolIcons());
        
        Map<String, Object> resultToolIcons = result.getToolIcons();
        assertNotNull(resultToolIcons.get("api_tool"));
        assertNotNull(resultToolIcons.get("dalle2"));
        
        // 验证对象类型的图标
        Map<String, Object> apiToolIcon = (Map<String, Object>) resultToolIcons.get("api_tool");
        assertEquals("#252525", apiToolIcon.get("background"));
        assertEquals("😁", apiToolIcon.get("content"));
        
        // 验证字符串类型的图标
        assertEquals("https://cloud.dify.ai/console/api/workspaces/current/tool-provider/builtin/dalle/icon", 
                resultToolIcons.get("dalle2"));
    }
    
    /**
     * 测试获取应用参数 - 空响应
     */
    @Test
    void testGetParametersWithNullResponse() {
        // 模拟RestTemplate响应为null
        ResponseEntity<Map> responseEntity = new ResponseEntity<>(null, HttpStatus.OK);
        when(restTemplate.exchange(
                eq(baseUrl + "/parameters"),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(responseEntity);

        // 执行测试
        DifyParameters result = difyAppService.getParameters(apiKey);

        // 验证结果
        assertNotNull(result);
        assertNull(result.getOpeningStatement());
        assertNull(result.getSuggestedQuestions());
        assertNull(result.getSuggestedQuestionsAfterAnswer());
        assertNull(result.getSpeechToText());
        assertNull(result.getTextToSpeech());
        assertNull(result.getRetrieverResource());
        assertNull(result.getAnnotationReply());
        assertNull(result.getMoreLikeThis());
        assertNull(result.getUserInputForm());
        assertNull(result.getSensitiveWordAvoidance());
        assertNull(result.getFileUpload());
        assertNull(result.getSystemParameters());
    }
} 