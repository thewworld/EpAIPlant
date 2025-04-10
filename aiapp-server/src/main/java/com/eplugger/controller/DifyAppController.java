package com.eplugger.controller;

import com.eplugger.model.DifyApp;
import com.eplugger.service.DifyAppService;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Dify应用控制器
 * 
 * @author jishuangjiang
 * @date 2025/3/24 10:00:00
 */
@RestController
@RequestMapping("/api/dify-apps")
@Log4j2
public class DifyAppController {

    @Autowired
    private DifyAppService difyAppService;

    /**
     * 创建Dify应用
     * 
     * @param difyApp 应用信息
     * @return 创建的应用
     */
    @PostMapping
    public ResponseEntity<DifyApp> create(@RequestBody DifyApp difyApp) {
        log.info("创建Dify应用: {}, 类型: {}", difyApp.getName(), difyApp.getType());
        return ResponseEntity.ok(difyAppService.create(difyApp));
    }

    /**
     * 更新Dify应用
     * 
     * @param id      应用ID
     * @param difyApp 应用信息
     * @return 更新后的应用
     */
    @PostMapping("/{id}")
    public ResponseEntity<DifyApp> update(@PathVariable Long id, @RequestBody DifyApp difyApp) {
        log.info("更新Dify应用: {}, 类型: {}", difyApp.getName(), difyApp.getType());
        difyApp.setId(id);
        return ResponseEntity.ok(difyAppService.update(difyApp));
    }

    /**
     * 删除Dify应用
     * 
     * @param id 应用ID
     * @return 删除结果
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("删除Dify应用: {}", id);
        difyAppService.delete(id);
        return ResponseEntity.ok().build();
    }

    /**
     * 获取Dify应用
     * 
     * @param id 应用ID
     * @return 应用信息
     */
    @GetMapping("/{id}")
    public ResponseEntity<DifyApp> getById(@PathVariable Long id) {
        log.info("获取Dify应用: {}", id);
        return ResponseEntity.ok(difyAppService.getById(id));
    }

    /**
     * 获取所有Dify应用
     * 
     * @param type 应用类型（可选）
     * @return 应用列表
     */
    @GetMapping
    public ResponseEntity<List<DifyApp>> getAll(@RequestParam(required = false) DifyApp.AppType type) {
        log.info("获取所有Dify应用, 类型过滤: {}", type);
        List<DifyApp> apps = difyAppService.getAll();
        if (type != null) {
            apps = apps.stream()
                    .filter(app -> type.equals(app.getType()))
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(apps);
    }
}