package com.eplugger.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.Map;

/**
 * Dify应用Meta信息实体类
 * 
 * @author jishuangjiang
 * @date 2025/3/26 16:15:00
 */
@Data
public class DifyAppMeta {
    
    /**
     * 工具图标
     */
    @JsonProperty("tool_icons")
    private Map<String, Object> toolIcons;
    
    /**
     * 图标对象
     */
    @Data
    public static class IconObject {
        /**
         * 背景色，hex格式
         */
        private String background;
        
        /**
         * 内容，emoji
         */
        private String content;
    }
} 