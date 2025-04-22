package com.eplugger.service;

import com.eplugger.model.DifyAppInfo;
import com.eplugger.model.DifyAppMeta;
import com.eplugger.model.DifyParameters;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * DifyAppService集成测试类
 * 注意：此测试需要Dify API服务可用，并配置正确的API Key
 * 
 * @author jishuangjiang
 * @date 2025/3/26 15:30:00
 */
@SpringBootTest
@ActiveProfiles("test") // 使用测试环境配置
public class DifyAppServiceIntegrationTest {

    @Autowired
    private DifyAppService difyAppService;
    

    private String difyApiKey="app-0FLLSJy8Irqr3r6TnFmrNgOe";
    
    /**
     * 测试获取应用参数
     * 注意：此测试需要实际的Dify API环境
     */
    @Test
    void testGetParameters() {
        // 如果没有配置测试API Key，则跳过测试
        org.junit.jupiter.api.Assumptions.assumeTrue(difyApiKey != null && !difyApiKey.isEmpty(),
                "Dify API Key未配置，跳过集成测试");
        
        // 执行测试
        DifyParameters result = difyAppService.getParameters(difyApiKey);
        
        // 验证结果
        assertNotNull(result);
        
        // 验证至少包含基本字段之一
        boolean hasBasicFields = result.getOpeningStatement() != null ||
                result.getUserInputForm() != null || 
                result.getFileUpload() != null ||
                result.getSystemParameters() != null;
                
        assertTrue(hasBasicFields, "响应应包含至少一个基本字段");
    }
    
    /**
     * 测试获取应用基本信息
     * 注意：此测试需要实际的Dify API环境
     */
    @Test
    void testGetAppInfo() {
        // 如果没有配置测试API Key，则跳过测试
        org.junit.jupiter.api.Assumptions.assumeTrue(difyApiKey != null && !difyApiKey.isEmpty(),
                "Dify API Key未配置，跳过集成测试");
        
        // 执行测试
        DifyAppInfo result = difyAppService.getAppInfo(difyApiKey);
        
        // 验证结果
        assertNotNull(result);
        
        // 验证应用名称
        assertNotNull(result.getName(), "应用名称不应为空");
    }
    
    /**
     * 测试获取应用Meta信息
     * 注意：此测试需要实际的Dify API环境
     */
    @Test
    void testGetAppMeta() {
        // 如果没有配置测试API Key，则跳过测试
        org.junit.jupiter.api.Assumptions.assumeTrue(difyApiKey != null && !difyApiKey.isEmpty(),
                "Dify API Key未配置，跳过集成测试");
        
        // 执行测试
        DifyAppMeta result = difyAppService.getAppMeta(difyApiKey);
        
        // 验证结果
        assertNotNull(result);
        
        // 如果返回了工具图标
        if (result.getToolIcons() != null) {
            assertNotNull(result.getToolIcons(), "工具图标不应为空");
        }
    }
} 