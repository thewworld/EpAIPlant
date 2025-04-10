-- 添加 chat_model 字段
ALTER TABLE dify_app ADD COLUMN chat_model VARCHAR(10) NOT NULL DEFAULT 'sse' COMMENT '对话模式: sse-流式响应, block-阻塞式响应';

-- 更新现有数据
UPDATE dify_app SET chat_model = 'sse' WHERE chat_model IS NULL; 