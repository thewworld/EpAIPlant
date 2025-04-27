package com.eplugger.service.impl;

import com.eplugger.model.*;
import com.eplugger.repository.DifyAppRepository;
import com.eplugger.service.DifyAppService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Dify应用服务实现类
 * 
 * @author jishuangjiang
 * @date 2025/3/24 10:00:00
 */
@Service
public class DifyAppServiceImpl implements DifyAppService {

    @Autowired
    private DifyAppRepository difyAppRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Value("${dify.api.base-url}")
    private String difyBaseUrl;

    /**
     * 最大开场问题数量
     */
    private static final int MAX_SUGGESTED_QUESTIONS = 10;

    @Override
    @Transactional
    public DifyApp create(DifyApp difyApp) {
        validateSuggestedQuestions(difyApp);
        return difyAppRepository.save(difyApp);
    }

    @Override
    @Transactional
    public DifyApp update(DifyApp difyApp) {
        if (!difyAppRepository.existsById(difyApp.getId())) {
            throw new RuntimeException("Dify应用不存在");
        }
        validateSuggestedQuestions(difyApp);
        return difyAppRepository.save(difyApp);
    }

    /**
     * 验证开场问题数量
     * 
     * @param difyApp Dify应用实例
     */
    private void validateSuggestedQuestions(DifyApp difyApp) {
        if (difyApp.getSuggestedQuestions() != null && difyApp.getSuggestedQuestions().size() > MAX_SUGGESTED_QUESTIONS) {
            throw new IllegalArgumentException("开场问题数量不能超过" + MAX_SUGGESTED_QUESTIONS + "个");
        }
    }

    @Override
    @Transactional
    public void delete(Long id) {
        difyAppRepository.deleteById(id);
    }

    @Override
    public DifyApp getById(Long id) {
        return difyAppRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dify应用不存在"));
    }

    @Override
    public List<DifyApp> getAll() {
        return difyAppRepository.findAll();
    }

    @Override
    public String getApiKeyById(Long id) {
        return getById(id).getApiKey();
    }
    
    /**
     * 获取应用参数
     * 用于进入页面一开始，获取功能开关、输入参数名称、类型及默认值等使用
     *
     * GET /v1/parameters
     * 响应包含：
     * - opening_statement：开场白
     * - suggested_questions：建议问题
     * - suggested_questions_after_answer：回答后建议问题
     * - speech_to_text：语音转文本
     * - text_to_speech：文本转语音
     * - retriever_resource：检索资源
     * - annotation_reply：注释回复
     * - more_like_this：更多类似
     * - user_input_form：用户输入表单配置，包含文本输入、段落文本、下拉控件等
     * - sensitive_word_avoidance：敏感词避免
     * - file_upload：文件上传配置
     * - system_parameters：系统参数，如文件大小限制等
     *
     * @param apiKey Dify应用API密钥
     * @return 应用参数，包含开场白、建议问题、回答后建议问题、语音转文本、文本转语音、检索资源、注释回复、更多类似、表单配置、敏感词避免、文件上传配置、系统参数等
     */
    @Override
    public DifyParameters getParameters(String apiKey) {
        String url = difyBaseUrl + "/parameters";
        HttpHeaders headers = createAuthHeaders(apiKey);
        
        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class
        );
        
        if (response.getBody() == null) {
            return new DifyParameters();
        }
        
        // 将Map转换为DifyParameters对象
        try {
            return objectMapper.convertValue(response.getBody(), DifyParameters.class);
        } catch (Exception e) {
            // 如果转换失败，手动构建对象
            DifyParameters parameters = new DifyParameters();
            Map<String, Object> responseBody = response.getBody();
            
            // 兼容旧版API，可能使用introduction字段而非opening_statement
            if (responseBody.containsKey("introduction")) {
                parameters.setOpeningStatement((String) responseBody.get("introduction"));
            } else if (responseBody.containsKey("opening_statement")) {
                parameters.setOpeningStatement((String) responseBody.get("opening_statement"));
            }
            
            // 添加其他新字段的处理
            if (responseBody.containsKey("suggested_questions")) {
                parameters.setSuggestedQuestions(objectMapper.convertValue(
                        responseBody.get("suggested_questions"), 
                        objectMapper.getTypeFactory().constructCollectionType(List.class, String.class)));
            }
            
            if (responseBody.containsKey("suggested_questions_after_answer")) {
                parameters.setSuggestedQuestionsAfterAnswer(objectMapper.convertValue(
                        responseBody.get("suggested_questions_after_answer"), 
                        DifyParameters.FeatureToggle.class));
            }
            
            if (responseBody.containsKey("speech_to_text")) {
                parameters.setSpeechToText(objectMapper.convertValue(
                        responseBody.get("speech_to_text"), 
                        DifyParameters.FeatureToggle.class));
            }
            
            if (responseBody.containsKey("text_to_speech")) {
                parameters.setTextToSpeech(objectMapper.convertValue(
                        responseBody.get("text_to_speech"), 
                        DifyParameters.TextToSpeech.class));
            }
            
            if (responseBody.containsKey("retriever_resource")) {
                parameters.setRetrieverResource(objectMapper.convertValue(
                        responseBody.get("retriever_resource"), 
                        DifyParameters.FeatureToggle.class));
            }
            
            if (responseBody.containsKey("annotation_reply")) {
                parameters.setAnnotationReply(objectMapper.convertValue(
                        responseBody.get("annotation_reply"), 
                        DifyParameters.FeatureToggle.class));
            }
            
            if (responseBody.containsKey("more_like_this")) {
                parameters.setMoreLikeThis(objectMapper.convertValue(
                        responseBody.get("more_like_this"), 
                        DifyParameters.FeatureToggle.class));
            }
            
            if (responseBody.containsKey("user_input_form")) {
                List<Map<String, Object>> rawForms = (List<Map<String, Object>>) responseBody.get("user_input_form");
                List<Map<DifyParameters.FormControlType, DifyParameters.FormControl>> formControls = new ArrayList<>();
                
                for (Map<String, Object> form : rawForms) {
                    for (Map.Entry<String, Object> entry : form.entrySet()) {
                        String type = entry.getKey();  // 获取类型名称，如"text-input"
                        Map<String, Object> controlData = (Map<String, Object>) entry.getValue();
                        
                        // 往控件数据中添加type属性
                        controlData.put("type", type);
                        
                        // 找到匹配的FormControlType枚举
                        DifyParameters.FormControlType controlType = null;
                        for (DifyParameters.FormControlType formType : DifyParameters.FormControlType.values()) {
                            if (formType.getValue().equals(type)) {
                                controlType = formType;
                                break;
                            }
                        }
                        
                        if (controlType != null) {
                            // 创建适当类型的FormControl
                            DifyParameters.FormControl control = null;
                            switch (controlType) {
                                case TEXT_INPUT:
                                    control = objectMapper.convertValue(controlData, DifyParameters.TextInput.class);
                                    break;
                                case PARAGRAPH:
                                    control = objectMapper.convertValue(controlData, DifyParameters.Paragraph.class);
                                    break;
                                case SELECT:
                                    control = objectMapper.convertValue(controlData, DifyParameters.Select.class);
                                    break;
                                case NUMBER:
                                    control = objectMapper.convertValue(controlData, DifyParameters.Number.class);
                                    break;
                                case FILE_INPUT:
                                    control = objectMapper.convertValue(controlData, DifyParameters.FileInput.class);
                                    break;
                                case FILE_LIST:
                                    control = objectMapper.convertValue(controlData, DifyParameters.FileList.class);
                                    break;
                            }
                            
                            if (control != null) {
                                Map<DifyParameters.FormControlType, DifyParameters.FormControl> controlMap = new HashMap<>();
                                controlMap.put(controlType, control);
                                formControls.add(controlMap);
                            }
                        }
                    }
                }
                
                parameters.setUserInputForm(formControls);
            }
            
            if (responseBody.containsKey("sensitive_word_avoidance")) {
                parameters.setSensitiveWordAvoidance(objectMapper.convertValue(
                        responseBody.get("sensitive_word_avoidance"), 
                        DifyParameters.SensitiveWordAvoidance.class));
            }
            
            if (responseBody.containsKey("file_upload")) {
                parameters.setFileUpload(objectMapper.convertValue(
                        responseBody.get("file_upload"), 
                        DifyParameters.FileUpload.class));
            }
            
            if (responseBody.containsKey("system_parameters")) {
                parameters.setSystemParameters(objectMapper.convertValue(
                        responseBody.get("system_parameters"), 
                        DifyParameters.SystemParameters.class));
            }
            
            return parameters;
        }
    }
    
    /**
     * 获取应用基本信息
     * 用于获取应用的名称、描述、标签等基本信息
     *
     * GET /v1/info
     * 响应包含：
     * - name：应用名称
     * - description：应用描述
     * - tags：应用标签
     *
     * @param apiKey Dify应用API密钥
     * @return 应用基本信息，包含名称、描述、标签等
     */
    @Override
    public DifyAppInfo getAppInfo(String apiKey) {
        String url = difyBaseUrl + "/info";
        HttpHeaders headers = createAuthHeaders(apiKey);
        
        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class
        );
        
        if (response.getBody() == null) {
            return new DifyAppInfo();
        }
        
        // 将Map转换为DifyAppInfo对象
        try {
            return objectMapper.convertValue(response.getBody(), DifyAppInfo.class);
        } catch (Exception e) {
            // 如果转换失败，手动构建对象
            DifyAppInfo appInfo = new DifyAppInfo();
            Map<String, Object> responseBody = response.getBody();
            
            if (responseBody.containsKey("name")) {
                appInfo.setName((String) responseBody.get("name"));
            }
            
            if (responseBody.containsKey("description")) {
                appInfo.setDescription((String) responseBody.get("description"));
            }
            
            if (responseBody.containsKey("tags")) {
                appInfo.setTags(objectMapper.convertValue(
                        responseBody.get("tags"), 
                        objectMapper.getTypeFactory().constructCollectionType(List.class, String.class)));
            }
            
            return appInfo;
        }
    }
    
    /**
     * 获取应用Meta信息
     * 用于获取工具图标等元数据信息
     *
     * GET /v1/meta
     * 响应包含：
     * - tool_icons：工具图标，可以是对象或字符串
     *   - 对象格式：包含background（背景色）和content（emoji）
     *   - 字符串格式：图标URL
     *
     * @param apiKey Dify应用API密钥
     * @return 应用Meta信息，包含工具图标等
     */
    @Override
    public DifyAppMeta getAppMeta(String apiKey) {
        String url = difyBaseUrl + "/meta";
        HttpHeaders headers = createAuthHeaders(apiKey);
        
        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class
        );
        
        if (response.getBody() == null) {
            return new DifyAppMeta();
        }
        
        // 将Map转换为DifyAppMeta对象
        try {
            return objectMapper.convertValue(response.getBody(), DifyAppMeta.class);
        } catch (Exception e) {
            // 如果转换失败，手动构建对象
            DifyAppMeta appMeta = new DifyAppMeta();
            Map<String, Object> responseBody = response.getBody();
            
            if (responseBody.containsKey("tool_icons")) {
                appMeta.setToolIcons((Map<String, Object>) responseBody.get("tool_icons"));
            }
            
            return appMeta;
        }
    }
    
    /**
     * 创建带有认证信息的HTTP请求头
     *
     * @param apiKey Dify应用API密钥
     * @return HTTP请求头
     */
    private HttpHeaders createAuthHeaders(String apiKey) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        return headers;
    }
}