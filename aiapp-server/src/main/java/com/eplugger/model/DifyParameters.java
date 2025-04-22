package com.eplugger.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * Dify应用参数实体类
 * 完整映射Dify API返回的应用配置参数
 * 
 * @author jishuangjiang
 * @date 2025/3/26 16:00:00
 */
@Data
public class DifyParameters {
    
    /**
     * 开场白，AI助手的初始问候语
     */
    @JsonProperty("opening_statement")
    private String openingStatement;
    
    /**
     * 引导问题，可展示给用户的预设问题列表
     */
    @JsonProperty("suggested_questions")
    private List<String> suggestedQuestions;
    
    /**
     * 回答后的建议问题配置
     */
    @JsonProperty("suggested_questions_after_answer")
    private FeatureToggle suggestedQuestionsAfterAnswer;
    
    /**
     * 语音转文本配置
     */
    @JsonProperty("speech_to_text")
    private FeatureToggle speechToText;
    
    /**
     * 文本转语音配置
     */
    @JsonProperty("text_to_speech")
    private TextToSpeech textToSpeech;
    
    /**
     * 检索资源配置
     */
    @JsonProperty("retriever_resource")
    private FeatureToggle retrieverResource;
    
    /**
     * 标注回复配置
     */
    @JsonProperty("annotation_reply")
    private FeatureToggle annotationReply;
    
    /**
     * "更多相似内容"功能配置
     */
    @JsonProperty("more_like_this")
    private FeatureToggle moreLikeThis;
    
    /**
     * 表单控件类型枚举
     */
    public enum FormControlType {
        @JsonProperty("text-input")
        TEXT_INPUT("text-input"),
        
        @JsonProperty("paragraph")
        PARAGRAPH("paragraph"),
        
        @JsonProperty("select")
        SELECT("select"),
        
        @JsonProperty("number")
        NUMBER("number"),
        
        @JsonProperty("file")
        FILE_INPUT("file"),
        
        @JsonProperty("file-list")
        FILE_LIST("file-list");
        
        private final String value;
        
        FormControlType(String value) {
            this.value = value;
        }
        
        public String getValue() {
            return value;
        }
    }
    
    /**
     * 用户输入表单配置，包含各种类型的表单控件
     */
    @JsonProperty("user_input_form")
    private List<Map<FormControlType, FormControl>> userInputForm;
    
    /**
     * 敏感词过滤配置
     */
    @JsonProperty("sensitive_word_avoidance")
    private SensitiveWordAvoidance sensitiveWordAvoidance;
    
    /**
     * 文件上传配置
     */
    @JsonProperty("file_upload")
    private FileUpload fileUpload;
    
    /**
     * 系统参数
     */
    @JsonProperty("system_parameters")
    private SystemParameters systemParameters;
    
    /**
     * 功能启用/禁用的基础类
     */
    @Data
    public static class FeatureToggle {
        /**
         * 是否启用功能
         */
        private boolean enabled;
    }
    
    /**
     * 文本转语音配置
     */
    @Data
    public static class TextToSpeech extends FeatureToggle {
        /**
         * 语言
         */
        private String language;
        
        /**
         * 语音
         */
        private String voice;
    }
    
    /**
     * 敏感词过滤配置
     */
    @Data
    public static class SensitiveWordAvoidance extends FeatureToggle {
        /**
         * 过滤类型
         */
        private String type;
        
        /**
         * 敏感词过滤详细配置
         */
        private SensitiveWordConfig config;
    }
    
    /**
     * 敏感词过滤详细配置
     */
    @Data
    public static class SensitiveWordConfig {
        /**
         * 输入过滤配置
         */
        @JsonProperty("inputs_config")
        private SensitiveWordFilterConfig inputsConfig;
        
        /**
         * 输出过滤配置
         */
        @JsonProperty("outputs_config")
        private SensitiveWordFilterConfig outputsConfig;
        
        /**
         * 关键词列表，多个关键词可用逗号分隔
         */
        private String keywords;
    }
    
    /**
     * 敏感词过滤器配置
     */
    @Data
    public static class SensitiveWordFilterConfig {
        /**
         * 是否启用过滤
         */
        private boolean enabled;
        
        /**
         * 预设回复内容，当检测到敏感词时返回
         */
        @JsonProperty("preset_response")
        private String presetResponse;
    }
    
    /**
     * 表单控件基类
     */
    @Data
    @JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        property = "type",
        visible = true
    )
    @JsonSubTypes({
        @JsonSubTypes.Type(value = TextInput.class, name = "text-input"),
        @JsonSubTypes.Type(value = Paragraph.class, name = "paragraph"),
        @JsonSubTypes.Type(value = Select.class, name = "select"),
        @JsonSubTypes.Type(value = Number.class, name = "number"),
        @JsonSubTypes.Type(value = FileInput.class, name = "file"),
        @JsonSubTypes.Type(value = FileList.class, name = "file-list")
    })
    public static class FormControl {
        /**
         * 标签
         */
        private String label;
        
        /**
         * 变量名
         */
        private String variable;
        
        /**
         * 是否必填
         */
        private boolean required;
        
        /**
         * 控件类型
         */
        private String type;
        
        /**
         * 最大长度
         */
        @JsonProperty("max_length")
        private Integer maxLength;
        
        /**
         * 选项列表
         */
        private List<String> options;
    }
    
    /**
     * 文本输入控件
     */
    @Data
    public static class TextInput extends FormControl {
    }
    
    /**
     * 段落文本输入控件
     */
    @Data
    public static class Paragraph extends FormControl {
    }
    
    /**
     * 下拉选择控件
     */
    @Data
    public static class Select extends FormControl {
    }
    
    /**
     * 数字输入控件
     */
    @Data
    public static class Number extends FormControl {
    }
    
    /**
     * 文件上传控件
     */
    @Data
    public static class FileInput extends FormControl {
        /**
         * 允许的文件上传方式
         */
        @JsonProperty("allowed_file_upload_methods")
        private List<String> allowedFileUploadMethods;
        
        /**
         * 允许的文件类型
         */
        @JsonProperty("allowed_file_types")
        private List<String> allowedFileTypes;
        
        /**
         * 允许的文件扩展名
         */
        @JsonProperty("allowed_file_extensions")
        private List<String> allowedFileExtensions;
    }
    
    /**
     * 文件列表上传控件
     */
    @Data
    public static class FileList extends FileInput {
    }
    
    /**
     * 文件上传配置
     */
    @Data
    public static class FileUpload {
        /**
         * 是否启用文件上传
         */
        private boolean enabled;
        
        /**
         * 图片上传配置
         */
        private ImageConfig image;
        
        /**
         * 允许的文件类型
         */
        @JsonProperty("allowed_file_types")
        private List<String> allowedFileTypes;
        
        /**
         * 允许的文件扩展名
         */
        @JsonProperty("allowed_file_extensions")
        private List<String> allowedFileExtensions;
        
        /**
         * 允许的文件上传方式
         */
        @JsonProperty("allowed_file_upload_methods")
        private List<String> allowedFileUploadMethods;
        
        /**
         * 文件数量限制
         */
        @JsonProperty("number_limits")
        private int numberLimits;
        
        /**
         * 文件上传详细配置
         */
        private FileUploadConfig fileUploadConfig;
    }
    
    /**
     * 图片上传配置
     */
    @Data
    public static class ImageConfig {
        /**
         * 是否启用图片上传
         */
        private boolean enabled;
        
        /**
         * 图片数量限制
         */
        @JsonProperty("number_limits")
        private int numberLimits;
        
        /**
         * 图片上传方式
         */
        @JsonProperty("transfer_methods")
        private List<String> transferMethods;
    }
    
    /**
     * 文件上传详细配置
     */
    @Data
    public static class FileUploadConfig {
        /**
         * 文件大小限制（MB）
         */
        @JsonProperty("file_size_limit")
        private int fileSizeLimit;
        
        /**
         * 批量上传数量限制
         */
        @JsonProperty("batch_count_limit")
        private int batchCountLimit;
        
        /**
         * 图片文件大小限制（MB）
         */
        @JsonProperty("image_file_size_limit")
        private int imageFileSizeLimit;
        
        /**
         * 视频文件大小限制（MB）
         */
        @JsonProperty("video_file_size_limit")
        private int videoFileSizeLimit;
        
        /**
         * 音频文件大小限制（MB）
         */
        @JsonProperty("audio_file_size_limit")
        private int audioFileSizeLimit;
        
        /**
         * 工作流文件上传限制（MB）
         */
        @JsonProperty("workflow_file_upload_limit")
        private int workflowFileUploadLimit;
    }
    
    /**
     * 系统参数
     */
    @Data
    public static class SystemParameters {
        /**
         * 文件大小限制（MB）
         */
        @JsonProperty("file_size_limit")
        private int fileSizeLimit;
        
        /**
         * 图片文件大小限制（MB）
         */
        @JsonProperty("image_file_size_limit")
        private int imageFileSizeLimit;
        
        /**
         * 音频文件大小限制（MB）
         */
        @JsonProperty("audio_file_size_limit")
        private int audioFileSizeLimit;
        
        /**
         * 视频文件大小限制（MB）
         */
        @JsonProperty("video_file_size_limit")
        private int videoFileSizeLimit;
        
        /**
         * 工作流文件上传限制（MB）
         */
        @JsonProperty("workflow_file_upload_limit")
        private int workflowFileUploadLimit;
    }
} 