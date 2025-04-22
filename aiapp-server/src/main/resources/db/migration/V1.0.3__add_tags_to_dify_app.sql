-- 添加tags字段到dify_app表
ALTER TABLE dify_app
ADD COLUMN tags VARCHAR(500);

-- 更新注释
COMMENT ON COLUMN dify_app.tags IS '应用标签，以逗号分隔存储多个标签'; 