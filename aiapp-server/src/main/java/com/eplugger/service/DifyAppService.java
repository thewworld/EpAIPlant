package com.eplugger.service;

import com.eplugger.model.*;
import java.util.List;

/**
 * Dify应用服务接口
 * 
 * @author jishuangjiang
 * @date 2025/3/24 10:00:00
 */
public interface DifyAppService {

    /**
     * 创建Dify应用
     * 
     * @param difyApp 应用信息
     * @return 创建的应用
     */
    DifyApp create(DifyApp difyApp);

    /**
     * 更新Dify应用
     * 
     * @param difyApp 应用信息
     * @return 更新后的应用
     */
    DifyApp update(DifyApp difyApp);

    /**
     * 删除Dify应用
     * 
     * @param id 应用ID
     */
    void delete(Long id);

    /**
     * 获取Dify应用
     * 
     * @param id 应用ID
     * @return 应用信息
     */
    DifyApp getById(Long id);

    /**
     * 获取所有Dify应用
     * 
     * @return 应用列表
     */
    List<DifyApp> getAll();

    /**
     * 根据ID获取API密钥
     * 
     * @param id 应用ID
     * @return API密钥
     */
    String getApiKeyById(Long id);
    
    /**
     * 获取应用参数
     * 用于进入页面一开始，获取功能开关、输入参数名称、类型及默认值等使用
     * 
     * GET /v1/parameters
     * 
     * @param apiKey Dify应用API密钥
     * @return 应用参数，包含开场白、表单配置、文件上传配置、系统参数等
     */
    DifyParameters getParameters(String apiKey);
    
    /**
     * 获取应用基本信息
     * 用于获取应用的名称、描述、标签等基本信息
     * 
     * GET /v1/info
     * 
     * @param apiKey Dify应用API密钥
     * @return 应用基本信息，包含名称、描述、标签等
     */
    DifyAppInfo getAppInfo(String apiKey);
    
    /**
     * 获取应用Meta信息
     * 用于获取工具图标等元数据信息
     * 
     * GET /v1/meta
     * 
     * @param apiKey Dify应用API密钥
     * @return 应用Meta信息，包含工具图标等
     */
    DifyAppMeta getAppMeta(String apiKey);
}