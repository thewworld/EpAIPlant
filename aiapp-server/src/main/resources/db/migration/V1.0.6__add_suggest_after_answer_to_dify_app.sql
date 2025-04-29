-- 向Dify应用表添加回答后推荐问题字段
ALTER TABLE `dify_app` 
ADD COLUMN `suggest_after_answer` BOOLEAN DEFAULT FALSE COMMENT '是否启用回答后推荐问题'; 