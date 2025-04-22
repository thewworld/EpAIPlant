package com.eplugger.service;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.List;
import java.util.Map;

public interface DifyCompService {
        /**
         * 发送流式文本生成消息
         *
         * @param query      用户输入的文本内容
         * @param inputs     变量值
         * @param user       用户标识
         * @param files      上传的文件列表
         * @param apiKey     API密钥
         * @param sseEmitter SSE发射器
         */
        void sendCompletionMessageStream(String query,
                        Map<String, Object> inputs,
                        String user,
                        List<Map<String, Object>> files,
                        String apiKey,
                        SseEmitter sseEmitter);

        /**
         * 发送阻塞式文本生成消息
         *
         * @param query  用户输入的文本内容
         * @param inputs 变量值
         * @param user   用户标识
         * @param files  上传的文件列表
         * @param apiKey API密钥
         * @return 响应结果
         */
        Map<String, Object> sendCompletionMessageBlock(String query,
                        Map<String, Object> inputs,
                        String user,
                        List<Map<String, Object>> files,
                        String apiKey);
}