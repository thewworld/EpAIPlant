package com.eplugger.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * @author jishuangjiang
 * @date 2025/3/24 9:56:51
 */
@Configuration
public class RestTemplateConfig {
    /**
     * 创建RestTemplate实例
     *
     * @return RestTemplate实例
     */
    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(120000); // 连接超时，单位毫秒
        factory.setReadTimeout(1200000);   // 读取超时，单位毫秒
        return new RestTemplate(factory);
    }
}
