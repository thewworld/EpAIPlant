package com.eplugger.model;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

/**
 * @author jishuangjiang
 * @date 2025/3/21 17:44:57
 */
public class DifyResponse {

    /**
     * 聊天完成响应(阻塞模式)
     */
    @Setter
    @Getter
    public static class ChatCompletionResponse {
        private String messageId;
        private String conversationId;
        private String mode;
        private String answer;
        private Map<String, Object> metadata;
        private List<Map<String, Object>> retrieverResources;
        private Long createdAt;

    }

    /**
     * 文件上传响应
     */
    @Getter
    @Setter
    public static class FileUploadResponse {
        private String id;
        private String name;
        private Integer size;
        private String extension;
        private String mimeType;
        private Integer createdBy;
        private Long createdAt;

    }

    /**
     * 操作结果响应
     */
    @Getter
    @Setter
    public static class OperationResult {
        private String result;

    }

    /**
     * 建议问题响应
     */
    @Getter
    @Setter
    public static class SuggestedQuestionsResponse {
        private String result;
        private List<String> data;

    }

    /**
     * 消息历史响应
     */
    @Getter
    @Setter
    public static class MessageHistoryResponse {
        private Integer limit;
        private Boolean hasMore;
        private List<MessageData> data;

        @Setter
        @Getter
        public static class MessageData {
            private String id;
            private String conversationId;
            private Map<String, Object> inputs;
            private String query;
            private String answer;
            private List<MessageFile> messageFiles;
            private Map<String, Object> feedback;
            private List<Map<String, Object>> retrieverResources;
            private Long createdAt;

        }

        @Setter
        @Getter
        public static class MessageFile {
            private String id;
            private String type;
            private String url;
            private String belongsTo;

        }
    }

    /**
     * 会话列表响应
     */
    @Getter
    @Setter
    public static class ConversationsResponse {
        private Integer limit;
        private Boolean hasMore;
        private List<ConversationData> data;

        @Setter
        @Getter
        public static class ConversationData {
            private String id;
            private String name;
            private Map<String, Object> inputs;
            private String status;
            private String introduction;
            private Long createdAt;
            private Long updatedAt;

        }
    }

    /**
     * 音频转文字响应
     */
    @Getter
    @Setter
    public static class AudioToTextResponse {
        private String text;

    }

    /**
     * 应用信息响应
     */
    @Getter
    @Setter
    public static class AppInfoResponse {
        private String name;
        private String description;
        private List<String> tags;

    }

}
