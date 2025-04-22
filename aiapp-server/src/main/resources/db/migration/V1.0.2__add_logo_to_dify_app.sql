-- 添加logo字段，用于存储SVG图片
ALTER TABLE dify_app ADD COLUMN logo TEXT COMMENT '应用logo，存储SVG格式图片'; 