# EPAI项目

EPAI是一个基于Spring Boot和Spring Cloud的人工智能应用平台。

## 项目结构

- `aiapp-server`: AI应用服务模块
- `gateway-server`: 网关服务模块
- `nacos-server`: 服务注册与发现模块

## 技术栈

- Java 17
- Spring Boot 3.2.4
- Spring Cloud 2023.0.1
- Spring Cloud Alibaba 2023.0.1.0
- Spring AI 1.0.0-M6

## 如何构建

使用Maven构建项目：

```bash
mvn clean package
```

## 如何启动

```bash
java -jar aiapp-server/target/aiapp-server-1.0-SNAPSHOT.jar
```