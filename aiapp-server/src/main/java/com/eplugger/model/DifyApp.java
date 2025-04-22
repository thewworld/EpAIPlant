package com.eplugger.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @Column(length = 1000)
    private String description;

    /**
     * 开场白
     */
    @Column(length = 2000)
    private String openerContent;

    /**
     * 应用用途类型, 比如科研, 写作,管理等
     */
    private String category;

    @Column(nullable = false)
    private String apiKey;

    /**
     * 应用标签，存储在单独的表中
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "dify_app_tags", joinColumns = @JoinColumn(name = "app_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    /**
     * 应用logo
     * 支持SVG、PNG、JPG、JPEG、WEBP、GIF等格式，存储为Base64编码的字符串
     */
    @Column(length = 10000)
    private String logo;


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
    @Column(length = 4000)
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
        TEXT, IMAGE
    }

    public String getFormConfig() {
        return formConfig;
    }

    public void setFormConfig(String formConfig) {
        this.formConfig = formConfig;
    }

    /**
     * 创建DifyApp实例时自动设置创建时间和更新时间
     */
    @PrePersist
    public void prePersist() {
        createTime = LocalDateTime.now();
        updateTime = LocalDateTime.now();
    }

    /**
     * 更新DifyApp实例时自动更新更新时间
     */
    @PreUpdate
    public void preUpdate() {
        updateTime = LocalDateTime.now();
    }
}