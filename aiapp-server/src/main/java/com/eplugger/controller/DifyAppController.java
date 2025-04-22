package com.eplugger.controller;

import com.eplugger.model.*;
import com.eplugger.service.DifyAppService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.HashMap;

/**
 * Dify应用控制器
 * 
 * @author jishuangjiang
 * @date 2025/3/24 10:00:00
 */
@RestController
@RequestMapping("/api/dify-apps")
@Log4j2
public class DifyAppController {

    @Autowired
    private DifyAppService difyAppService;
    
    @Autowired
    private ObjectMapper objectMapper;

    /**
     * 创建Dify应用
     * 
     * @param difyApp 应用信息
     * @return 创建的应用
     */
    @PostMapping
    public ResponseEntity<DifyApp> create(@RequestBody DifyApp difyApp) {
        log.info("创建Dify应用: {}, 类型: {}", difyApp.getName(), difyApp.getType());
        log.info("标签: {}", difyApp.getTags());
        return ResponseEntity.ok(difyAppService.create(difyApp));
    }

    /**
     * 更新Dify应用
     * 
     * @param id      应用ID
     * @param difyApp 应用信息
     * @return 更新后的应用
     */
    @PostMapping("/{id}")
    public ResponseEntity<DifyApp> update(@PathVariable Long id, @RequestBody DifyApp difyApp) {
        log.info("更新Dify应用: {}, 类型: {}", difyApp.getName(), difyApp.getType());
        difyApp.setId(id);
        return ResponseEntity.ok(difyAppService.update(difyApp));
    }

    /**
     * 删除Dify应用
     * 
     * @param id 应用ID
     * @return 删除结果
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("删除Dify应用: {}", id);
        difyAppService.delete(id);
        return ResponseEntity.ok().build();
    }

    /**
     * 获取Dify应用
     * 
     * @param id 应用ID
     * @return 应用信息
     */
    @GetMapping("/{id}")
    public ResponseEntity<DifyApp> getById(@PathVariable Long id) {
        log.info("获取Dify应用: {}", id);
        return ResponseEntity.ok(difyAppService.getById(id));
    }

    /**
     * 获取所有Dify应用
     * 
     * @param type 应用类型（可选）
     * @return 应用列表
     */
    @GetMapping
    public ResponseEntity<List<DifyApp>> getAll(@RequestParam(required = false) DifyApp.AppType type) {
        log.info("获取所有Dify应用, 类型过滤: {}", type);
        List<DifyApp> apps = difyAppService.getAll();
        if (type != null) {
            apps = apps.stream()
                    .filter(app -> type.equals(app.getType()))
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(apps);
    }
    
    /**
     * 同步Dify应用信息
     * 根据API Key从Dify获取应用信息，包括应用参数、基本信息和Meta信息
     * 
     * @param apiKey Dify应用API密钥
     * @return 同步后的应用信息
     */
    @GetMapping("/sync")
    public ResponseEntity<DifyApp> syncAppInfo(@RequestParam String apiKey) {
        log.info("同步Dify应用信息, API Key: {}", apiKey);
        
        try {
            // 获取应用参数信息
            DifyParameters parameters = difyAppService.getParameters(apiKey);
            
            // 获取应用基本信息
            DifyAppInfo appInfo = difyAppService.getAppInfo(apiKey);
            
            // 获取应用Meta信息
            DifyAppMeta appMeta = difyAppService.getAppMeta(apiKey);
            
            // 构建DifyApp对象
            DifyApp difyApp = new DifyApp();
            difyApp.setApiKey(apiKey);
            
            // 设置默认输入输出类型
            difyApp.setInputType(DifyApp.InputType.TEXT);
            difyApp.setOutputType(DifyApp.OutputType.TEXT);
            
            // 默认应用类型为Chat
            difyApp.setType(DifyApp.AppType.Chat);
            
            // 设置对话模式为流式响应
            difyApp.setChatModel("sse");
            
            // 设置应用基本信息
            if (appInfo != null) {
                difyApp.setName(appInfo.getName());
                difyApp.setDescription(appInfo.getDescription());
                
                // 如果有标签，直接设置到tags字段
                if (appInfo.getTags() != null && !appInfo.getTags().isEmpty()) {
                    difyApp.setTags(appInfo.getTags());
                    
                    // 同时设置第一个标签为category
                    if (!appInfo.getTags().isEmpty()) {
                        difyApp.setCategory(appInfo.getTags().get(0));
                    }
                }
            }
            
            // 设置应用参数信息
            if (parameters != null) {
                // 设置开场白内容，兼容旧版本字段
                if (parameters.getOpeningStatement() != null) {
                    difyApp.setOpenerContent(parameters.getOpeningStatement());
                }
                
                // 存储表单配置为JSON字符串
                if (parameters.getUserInputForm() != null) {
                    difyApp.setFormConfig(convertFormConfigToJson(parameters.getUserInputForm()));
                }
                
                // 如果有文件上传配置，设置输入类型为FILE
                if (parameters.getFileUpload() != null && 
                    parameters.getFileUpload().getImage() != null && 
                    parameters.getFileUpload().getImage().isEnabled()) {
                    difyApp.setInputType(DifyApp.InputType.FILE);
                }
            }
            
            // 设置应用Meta信息（如果有logo相关信息）
            if (appMeta != null && appMeta.getToolIcons() != null) {
                setLogoFromToolIcons(difyApp, appMeta.getToolIcons());
            }
            
            log.info("同步Dify应用信息成功: {}", difyApp.getName());
            return ResponseEntity.ok(difyApp);
        } catch (Exception e) {
            log.error("同步Dify应用信息失败", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 将表单配置转换为JSON字符串
     * 
     * @param userInputForm 用户输入表单配置
     * @return JSON字符串
     */
    private String convertFormConfigToJson(List<Map<DifyParameters.FormControlType, DifyParameters.FormControl>> userInputForm) {
        try {
            // 将嵌套的Map结构转换为表单配置JSON格式
            List<Map<String, Object>> formConfigList = new ArrayList<>();
            
            for (Map<DifyParameters.FormControlType, DifyParameters.FormControl> controlMap : userInputForm) {
                for (Map.Entry<DifyParameters.FormControlType, DifyParameters.FormControl> entry : controlMap.entrySet()) {
                    Map<String, Object> formItem = new HashMap<>();
                    Map<String, Object> controlConfig = new HashMap<>();
                    
                    // 将FormControl对象转换为Map
                    controlConfig.put("label", entry.getValue().getLabel());
                    controlConfig.put("variable", entry.getValue().getVariable());
                    controlConfig.put("required", entry.getValue().isRequired());
                    controlConfig.put("type", entry.getValue().getType());
                    controlConfig.put("max_length", entry.getValue().getMaxLength());
                    
                    if (entry.getValue().getOptions() != null) {
                        controlConfig.put("options", entry.getValue().getOptions());
                    }
                    
                    // 处理文件类型特殊字段
                    if (entry.getValue() instanceof DifyParameters.FileInput) {
                        DifyParameters.FileInput fileInput = (DifyParameters.FileInput) entry.getValue();
                        if (fileInput.getAllowedFileUploadMethods() != null) {
                            controlConfig.put("allowed_file_upload_methods", fileInput.getAllowedFileUploadMethods());
                        }
                        if (fileInput.getAllowedFileTypes() != null) {
                            controlConfig.put("allowed_file_types", fileInput.getAllowedFileTypes());
                        }
                        if (fileInput.getAllowedFileExtensions() != null) {
                            controlConfig.put("allowed_file_extensions", fileInput.getAllowedFileExtensions());
                        }
                    }
                    
                    // 添加到外层结构
                    formItem.put(entry.getKey().getValue(), controlConfig);
                    formConfigList.add(formItem);
                }
            }
            
            return objectMapper.writeValueAsString(formConfigList);
        } catch (Exception e) {
            log.error("转换表单配置为JSON失败", e);
            return "{}";
        }
    }
    
    /**
     * 从工具图标中提取并设置应用logo
     * 支持SVG和各种图片格式(PNG、JPG、JPEG、WEBP、GIF)
     * 
     * @param difyApp DifyApp对象
     * @param toolIcons 工具图标
     */
    private void setLogoFromToolIcons(DifyApp difyApp, Map<String, Object> toolIcons) {
        // 尝试查找app_icon或默认图标
        String logoData = null;
        
        // 首先尝试app_icon
        if (toolIcons.containsKey("app_icon")) {
            Object icon = toolIcons.get("app_icon");
            if (icon instanceof String) {
                logoData = (String) icon;
                // 如果是Base64图片数据，直接使用
                if (logoData.startsWith("data:image/")) {
                    difyApp.setLogo(logoData);
                    return;
                }
                // 否则当作SVG处理
            } else if (icon instanceof Map) {
                // 如果是对象格式，转换为SVG
                Map<String, Object> iconMap = (Map<String, Object>) icon;
                if (iconMap.containsKey("content") && iconMap.containsKey("background")) {
                    String content = String.valueOf(iconMap.get("content"));
                    String background = String.valueOf(iconMap.get("background"));
                    logoData = generateSvgFromIconObject(content, background);
                }
            }
        }
        
        // 如果没有找到app_icon，使用第一个可用的图标
        if (logoData == null && !toolIcons.isEmpty()) {
            for (Map.Entry<String, Object> entry : toolIcons.entrySet()) {
                Object icon = entry.getValue();
                if (icon instanceof String) {
                    logoData = (String) icon;
                    // 如果是Base64图片数据，直接使用
                    if (logoData.startsWith("data:image/")) {
                        difyApp.setLogo(logoData);
                        return;
                    }
                    // 否则当作SVG处理
                    break;
                } else if (icon instanceof Map) {
                    Map<String, Object> iconMap = (Map<String, Object>) icon;
                    if (iconMap.containsKey("content") && iconMap.containsKey("background")) {
                        String content = String.valueOf(iconMap.get("content"));
                        String background = String.valueOf(iconMap.get("background"));
                        logoData = generateSvgFromIconObject(content, background);
                        break;
                    }
                }
            }
        }
        
        // 设置logo
        if (logoData != null) {
            difyApp.setLogo(logoData);
        }
    }
    
    /**
     * 从图标对象生成SVG
     * 
     * @param content emoji内容
     * @param background 背景色
     * @return SVG字符串
     */
    private String generateSvgFromIconObject(String content, String background) {
        // 创建简单的SVG，将emoji放在有背景色的圆形中
        return String.format(
            "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\">" +
            "<circle cx=\"50\" cy=\"50\" r=\"40\" fill=\"%s\"/>" +
            "<text x=\"50\" y=\"50\" font-size=\"40\" text-anchor=\"middle\" dominant-baseline=\"central\">%s</text>" +
            "</svg>",
            background, content
        );
    }
}