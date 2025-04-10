package com.eplugger.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Dify应用实体类
 * 
 * @author jishuangjiang
 * @date 2025/3/24 10:00:00
 */
@Data
@Entity
@Table(name = "dify_app")
public class DifyApp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    /**
     * 开场白
     */
    @Column(length = 500)
    private String openerContent;

    /**
     * 应用用途类型, 比如科研, 写作,管理等
     */
    @Column(length = 50)
    private String category;

    @Column(nullable = false)
    private String apiKey;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private InputType inputType;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private OutputType outputType;

    @CreationTimestamp
    private LocalDateTime createTime;

    @UpdateTimestamp
    private LocalDateTime updateTime;

    @Column(name = "chat_model")
    private String chatModel; // sse: 流式响应, block: 阻塞式响应

    /**
     * 表单配置，JSON格式
     */
    @Column(name = "form_config", columnDefinition = "TEXT")
    private String formConfig;

    /**
     * 应用类型枚举
     */
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AppType type = AppType.Chat; // 默认为Chat类型

    /**
     * 应用类型枚举
     */
    public enum AppType {
        /** 对话式应用 */
        Chat,
        /** 工作流应用 */
        Workflow,
        /** 文本生成应用 */
        Completion
    }

    /**
     * 输入类型枚举
     */
    public enum InputType {
        TEXT, FILE
    }

    /**
     * 输出类型枚举
     */
    public enum OutputType {
        TEXT, FILE
    }

    public String getFormConfig() {
        return formConfig;
    }

    public void setFormConfig(String formConfig) {
        this.formConfig = formConfig;
    }
}