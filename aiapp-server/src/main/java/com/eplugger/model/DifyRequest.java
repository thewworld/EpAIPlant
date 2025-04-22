package com.eplugger.model;

import lombok.Getter;
import lombok.Setter;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * @author jishuangjiang
 * @date 2025/3/21 17:44:37
 */
public class DifyRequest {

    /**
     * 聊天消息请求
     */
    @Setter
    @Getter
    public static class ChatMessageRequest {
        private String query;
        private Map<String, Object> inputs;
        private String user;
        private String conversationId;
        private String responseMode;
        private List<Map<String, Object>> files;
        private Boolean autoGenerateName;

    }

    /**
     * 文件上传请求
     */
    @Setter
    @Getter
    public static class FileUploadRequest {
        private byte[] file;
        private String fileName;
        private String fileType;
        private String user;

    }

    /**
     * 停止响应请求
     */
    @Setter
    @Getter
    public static class StopResponseRequest {
        private String user;

    }

    /**
     * 消息反馈请求
     */
    @Setter
    @Getter
    public static class MessageFeedbackRequest {
        private String rating;
        private String user;
        private String content;

    }

    /**
     * 会话重命名请求
     */
    @Setter
    @Getter
    public static class RenameConversationRequest {
        private String name;
        private Boolean autoGenerate;
        private String user;

    }

    /**
     * 文字转语音请求
     */
    @Setter
    @Getter
    public static class TextToAudioRequest {
        private String messageId;
        private String text;
        private String user;

    }

    /**
     * 工作流请求
     */
    @Data
    public static class WorkflowRequest {
        /**
         * 工作流输入参数
         */
        private Map<String, Object> inputs;

        /**
         * 用户标识
         */
        private String user;
    }

    /**
     * 文本生成请求
     */
    @Data
    public static class CompletionRequest {
        /**
         * 用户输入的文本内容
         */
        private String query;

        /**
         * 变量值
         */
        private Map<String, Object> inputs;

        /**
         * 用户标识
         */
        private String user;

        /**
         * 上传的文件列表
         */
        private List<Map<String, Object>> files;
    }
}
