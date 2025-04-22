package com.eplugger.model;

import lombok.Data;

import java.util.List;

/**
 * Dify应用基本信息实体类
 * 
 * @author jishuangjiang
 * @date 2025/3/26 16:10:00
 */
@Data
public class DifyAppInfo {
    
    /**
     * 应用名称
     */
    private String name;
    
    /**
     * 应用描述
     */
    private String description;
    
    /**
     * 应用标签
     */
    private List<String> tags;
} 