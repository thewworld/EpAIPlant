package com.eplugger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * @author jishuangjiang
 * @date 2025/3/21 17:39:40
 */
@EnableAsync
@SpringBootApplication
public class AIAppServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AIAppServiceApplication.class, args);
    }
}
