package com.eplugger.service;

import java.util.List;
import java.util.Map;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * Dify Workflow服务接口
 * 
 * @author jishuangjiang
 * @date 2025/3/25 10:00:00
 */
public interface DifyWorkflowService {

        /**
         * 执行工作流 (流式响应)
         *
         * @param inputs       工作流变量输入
         * @param responseMode 响应模式 (streaming/blocking)
         * @param user         用户标识
         * @param apiKey       应用密钥
         * @param sseEmitter   SSE发射器
         */
        void workflowRun(Map<String, Object> inputs,
                        String responseMode,
                        String user,
                        String apiKey,
                        SseEmitter sseEmitter);

        /**
         * 执行工作流 (阻塞式响应)
         *
         * @param inputs 工作流变量输入
         * @param user   用户标识
         * @param apiKey 应用密钥
         * @return 工作流执行结果
         */
        Map<String, Object> workflowRunBlock(Map<String, Object> inputs,
                        String user,
                        String apiKey);


        /**
         * 获取工作流会话历史
         *
         * @param conversationId 会话ID
         * @param user           用户标识
         * @param firstId        当前页第一条记录ID
         * @param limit          返回条数
         * @param apiKey         应用密钥
         * @return 历史消息列表
         */
        Map<String, Object> getMessageHistory(String conversationId,
                        String user,
                        String firstId,
                        Integer limit,
                        String apiKey);

        /**
         * 获取工作流会话列表
         *
         * @param user   用户标识
         * @param lastId 当前页最后一条记录ID
         * @param limit  返回条数
         * @param sortBy 排序字段
         * @param apiKey 应用密钥
         * @return 会话列表
         */
        Map<String, Object> getConversations(String user,
                        String lastId,
                        Integer limit,
                        String sortBy,
                        String apiKey);

        /**
         * 删除工作流会话
         *
         * @param conversationId 会话ID
         * @param user           用户标识
         * @param apiKey         应用密钥
         * @return 删除结果
         */
        Map<String, Object> deleteConversation(String conversationId,
                        String user,
                        String apiKey);

        /**
         * 重命名工作流会话
         *
         * @param conversationId 会话ID
         * @param name           新名称
         * @param autoGenerate   是否自动生成名称
         * @param user           用户标识
         * @param apiKey         应用密钥
         * @return 重命名结果
         */
        Map<String, Object> renameConversation(String conversationId,
                        String name,
                        Boolean autoGenerate,
                        String user,
                        String apiKey);
}