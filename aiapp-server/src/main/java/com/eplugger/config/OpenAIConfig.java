package com.eplugger.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @author jishuangjiang
 * @date 2025/3/21 17:46:35
 */
@Configuration
public class OpenAIConfig {
    @Bean
    ChatClient chatClient(ChatClient.Builder builder) {
        return builder.defaultSystem("你是一个科研领域的专家，善于回答关于科研领域的问题。").build();
    }
}
