package com.eplugger.controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

/**
 * @author jishuangjiang
 * @date 2025/3/21 17:56:42
 */
@RestController
@RequestMapping("/api/ai")
public class OpenAIController {

    @Autowired
    private ChatClient aiClient;

    @GetMapping("/chat")
    public String chatWithClient(@RequestParam(value = "message", defaultValue = "讲述你的功能") String message) {
        return this.aiClient.prompt()
                .user(message)
                .call()
                .content();
    }

    @GetMapping(value = "/chat/stream", produces = "text/html;charset=UTF-8")
    public Flux<String> chatWithClientStream(@RequestParam(value = "message", defaultValue = "讲述你的功能") String message) {
        return aiClient.prompt()
                .user(message)
                .stream()
                .content();
    }
}
