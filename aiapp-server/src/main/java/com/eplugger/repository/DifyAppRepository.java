package com.eplugger.repository;

import com.eplugger.model.DifyApp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Dify应用数据访问接口
 * 
 * @author jishuangjiang
 * @date 2025/3/24 10:00:00
 */
@Repository
public interface DifyAppRepository extends JpaRepository<DifyApp, Long> {
    // 基础的CRUD方法由JpaRepository提供
}