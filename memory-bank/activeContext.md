# EPAI项目当前上下文

## 项目基本信息

- 项目名称：EPAI（AI应用平台）
- 开发阶段：创意设计→实现阶段
- 当前操作系统：Windows
- 复杂度级别：Level 2（集成型增强）

## 当前焦点

- 创意设计成果转化为实现计划
- 错误处理与重试机制架构实现
- API密钥安全管理体系建设
- 流式响应优化准备

## 项目组件

### 后端结构
- `aiapp-server`: AI应用服务模块
  - 控制器层：处理HTTP请求
  - 服务层：业务逻辑实现
  - 数据模型层：数据结构定义
  - 数据访问层：数据库交互
  - 配置层：应用配置

### 前端结构
- `aiapp-server/web`: 基于Next.js的前端应用
  - 页面组件
  - UI组件
  - 自定义Hooks
  - 工具库
  - 类型定义

## 关键配置信息

- 服务器端口：8087
- 数据库：MySQL (172.16.1.23:10007)
- AI模型：qwen-max-0125
- Dify API地址：http://172.16.1.40/v1 

## 环境验证结果

- Java版本：OpenJDK 17.0.11（兼容项目要求的Java 17）
- Maven版本：Apache Maven 3.9.9
- 操作系统：Windows 10.0.22631
- Memory Bank系统：已初始化基础文件

## 技术验证结果

- 后端框架：Spring Boot 3.2.4已配置并运行正常
- 数据库整合：MySQL已配置，使用JPA进行数据访问
- API集成：Dify API和OpenAI API已集成
- 前端框架：Next.js 15.2.4已配置
- 流式响应：已实现SSE（Server-Sent Events）机制
- 文件上传：支持多种文件类型上传

## 创意设计成果

- **错误处理架构**：采用Resilience4j提供弹性编程功能，包括断路器、重试、限流和超时控制
- **流式响应优化**：采用基于WebSocket的混合架构，提供全双工通信、心跳检测和断线重连
- **API密钥安全**：采用混合加密与缓存方案，实现双层加密保护和密钥轮换机制

## 下一步实施计划

- 添加Resilience4j依赖和配置
- 实现全局异常处理器
- 更新数据模型添加密钥管理字段
- 实现API密钥加密服务
- 准备WebSocket基础设施