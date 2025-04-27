-- 创建Dify应用开场问题表
CREATE TABLE IF NOT EXISTS `dify_app_suggested_questions` (
  `app_id` BIGINT NOT NULL,
  `question` VARCHAR(500) NOT NULL,
  PRIMARY KEY (`app_id`, `question`),
  FOREIGN KEY (`app_id`) REFERENCES `dify_app` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 