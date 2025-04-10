package com.eplugger.service.impl;

import com.eplugger.model.DifyApp;
import com.eplugger.repository.DifyAppRepository;
import com.eplugger.service.DifyAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Dify应用服务实现类
 * 
 * @author jishuangjiang
 * @date 2025/3/24 10:00:00
 */
@Service
public class DifyAppServiceImpl implements DifyAppService {

    @Autowired
    private DifyAppRepository difyAppRepository;

    @Override
    @Transactional
    public DifyApp create(DifyApp difyApp) {
        return difyAppRepository.save(difyApp);
    }

    @Override
    @Transactional
    public DifyApp update(DifyApp difyApp) {
        if (!difyAppRepository.existsById(difyApp.getId())) {
            throw new RuntimeException("Dify应用不存在");
        }
        return difyAppRepository.save(difyApp);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        difyAppRepository.deleteById(id);
    }

    @Override
    public DifyApp getById(Long id) {
        return difyAppRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dify应用不存在"));
    }

    @Override
    public List<DifyApp> getAll() {
        return difyAppRepository.findAll();
    }

    @Override
    public String getApiKeyById(Long id) {
        return getById(id).getApiKey();
    }
}