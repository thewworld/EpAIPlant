package com.eplugger.service;

import java.util.List;
import java.util.Map;

/**
 * @author jishuangjiang
 * @date 2025/3/21 17:41:54
 */

public interface DifyChatService {

    /**
     * 发送对话消息 (基于SSE的流式响应)
     *
     * @param query            用户输入/提问内容
     * @param inputs           允许传入App定义的各变量值
     * @param user             用户标识
     * @param conversationId   会话ID
     * @param files            文件列表
     * @param autoGenerateName 是否自动生成标题
     * @param apiKey           应用密钥
     * @param sseEmitter       用于发送流式响应的SSE发射器
     */
    void sendChatMessageStream(String query, Map<String, Object> inputs, String user,
            String conversationId, List<Map<String, Object>> files,
            Boolean autoGenerateName, String apiKey,
            org.springframework.web.servlet.mvc.method.annotation.SseEmitter sseEmitter);

    /**
     * 上传文件
     *
     * @param fileBytes 文件字节数组
     * @param fileName  文件名
     * @param fileType  文件MIME类型
     * @param user      用户标识
     * @param apiKey    应用密钥
     * @return 上传结果
     */
    Map<String, Object> uploadFile(byte[] fileBytes, String fileName, String fileType, String user, String apiKey);

    /**
     * 停止响应
     *
     * @param taskId 任务ID
     * @param user   用户标识
     * @param apiKey 应用密钥
     * @return 停止结果
     */
    Map<String, Object> stopResponse(String taskId, String user, String apiKey);

    /**
     * 消息反馈
     *
     * @param messageId 消息ID
     * @param rating    反馈类型(like/dislike/null)
     * @param user      用户标识
     * @param content   反馈内容
     * @param apiKey    应用密钥
     * @return 反馈结果
     */
    Map<String, Object> messageFeedback(String messageId, String rating, String user, String content, String apiKey);

    /**
     * 获取下一轮建议问题列表
     *
     * @param messageId 消息ID
     * @param user      用户标识
     * @param apiKey    应用密钥
     * @return 问题列表
     */
    List<String> getSuggestedQuestions(String messageId, String user, String apiKey);

    /**
     * 获取会话历史消息
     *
     * @param conversationId 会话ID
     * @param user           用户标识
     * @param firstId        当前页第一条聊天记录的ID
     * @param limit          返回条数
     * @param apiKey         应用密钥
     * @return 历史消息列表
     */
    Map<String, Object> getMessageHistory(String conversationId, String user, String firstId, Integer limit,
            String apiKey);

    /**
     * 获取会话列表
     *
     * @param user   用户标识
     * @param lastId 当前页最后一条记录的ID
     * @param limit  返回条数
     * @param sortBy 排序字段
     * @param apiKey 应用密钥
     * @return 会话列表
     */
    Map<String, Object> getConversations(String user, String lastId, Integer limit, String sortBy, String apiKey);

    /**
     * 删除会话
     *
     * @param conversationId 会话ID
     * @param user           用户标识
     * @param apiKey         应用密钥
     * @return 删除结果
     */
    Map<String, Object> deleteConversation(String conversationId, String user, String apiKey);

    /**
     * 会话重命名
     *
     * @param conversationId 会话ID
     * @param name           新名称
     * @param autoGenerate   是否自动生成名称
     * @param user           用户标识
     * @param apiKey         应用密钥
     * @return 重命名结果
     */
    Map<String, Object> renameConversation(String conversationId, String name, Boolean autoGenerate, String user,
            String apiKey);

    /**
     * 语音转文字
     *
     * @param audioBytes 音频文件字节数组
     * @param fileName   文件名
     * @param user       用户标识
     * @param apiKey     应用密钥
     * @return 转换结果
     */
    Map<String, Object> audioToText(byte[] audioBytes, String fileName, String user, String apiKey);

    /**
     * 文字转语音
     *
     * @param messageId 消息ID
     * @param text      转换文本
     * @param user      用户标识
     * @param apiKey    应用密钥
     * @return 转换结果(音频字节数组)
     */
    byte[] textToAudio(String messageId, String text, String user, String apiKey);

    /**
     * 获取应用基本信息
     *
     * @param apiKey 应用密钥
     * @return 应用信息
     */
    Map<String, Object> getAppInfo(String apiKey);

    /**
     * 获取应用参数
     *
     * @param apiKey 应用密钥
     * @return 应用参数
     */
    Map<String, Object> getParameters(String apiKey);

    /**
     * 获取应用Meta信息
     *
     * @param apiKey 应用密钥
     * @return Meta信息
     */
    Map<String, Object> getMetaInfo(String apiKey);

    /**
     * 阻塞式发送对话消息
     *
     * @param query            用户问题
     * @param inputs           输入参数
     * @param user             用户标识
     * @param conversationId   会话ID
     * @param files            文件列表
     * @param autoGenerateName 是否自动生成名称
     * @param apiKey           API密钥
     * @return 响应内容
     */
    Map<String, Object> sendChatMessageBlock(String query, Map<String, Object> inputs, String user,
            String conversationId, List<Map<String, Object>> files, Boolean autoGenerateName, String apiKey);
}
