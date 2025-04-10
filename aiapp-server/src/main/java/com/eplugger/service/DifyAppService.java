package com.eplugger.service;

import com.eplugger.model.DifyApp;
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
}