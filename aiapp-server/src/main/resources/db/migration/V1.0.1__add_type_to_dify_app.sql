ALTER TABLE dify_app
ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'Chat' COMMENT '应用类型：Chat-对话式应用，Workflow-工作流应用'; 