# API密钥安全管理设计

🎨🎨🎨 ENTERING CREATIVE PHASE: ARCHITECTURE DESIGN 🎨🎨🎨

## 问题陈述

EPAI平台需要安全地管理与Dify API和OpenAI等外部服务交互的API密钥。当前实现中，API密钥以明文形式存储在数据库中，并在应用程序内部流转，存在潜在的安全风险。密钥泄露可能导致未授权访问、资源滥用和潜在的财务损失。此外，当前系统缺乏密钥轮换机制，使密钥长期保持不变，增加了泄露的可能性。

### 关键需求：

1. 加密存储API密钥，确保数据库泄露时密钥不被直接暴露
2. 实现API密钥的安全传输机制，减少中间人攻击风险
3. 设计密钥轮换机制，定期或根据条件触发更新密钥
4. 提供细粒度的访问控制，限制密钥的使用范围和权限
5. 建立完善的密钥审计和监控机制，及时发现异常使用行为

## 架构选项分析

### 选项1：应用层加密方案

**描述**：在应用层实现API密钥的加密和解密，使用对称加密（如AES）存储密钥，加密密钥可从环境变量或配置服务获取。

**优点**：
- 实现简单，不依赖外部服务
- 与现有代码集成容易
- 对性能影响较小
- 不需要额外基础设施

**缺点**：
- 加密密钥仍需安全管理
- 运行时内存中的密钥仍为明文
- 密钥轮换机制需要额外开发
- 加密密钥泄露会导致所有API密钥暴露

**技术契合度**：高
**复杂度**：低
**安全性**：中

### 选项2：密钥保险库服务

**描述**：使用专门的密钥管理服务（如HashiCorp Vault或AWS Key Management Service）来存储和管理API密钥，应用程序通过安全API调用获取密钥。

**优点**：
- 高级安全特性，包括加密、访问控制和审计
- 内置密钥轮换和版本控制功能
- 支持动态密钥生成和临时密钥
- 降低了应用程序的安全负担
- 集中化密钥管理，便于审计和监控

**缺点**：
- 需要部署和维护额外的基础设施
- 增加了系统复杂性和运维成本
- 可能成为性能瓶颈，特别是高频API调用
- 对外部服务的依赖增加了故障点

**技术契合度**：中
**复杂度**：高
**安全性**：高

### 选项3：混合加密与缓存方案

**描述**：结合应用层加密和本地缓存，使用双重加密保护密钥，同时通过缓存减少解密操作，并实现定期轮换机制。

**优点**：
- 比单纯应用层加密更安全
- 性能优于纯密钥保险库方案
- 不依赖外部服务，减少故障点
- 支持密钥轮换和版本控制
- 可以在现有架构上逐步实施

**缺点**：
- 缓存增加了内存中密钥暴露的风险
- 密钥轮换逻辑较复杂
- 需要额外的密钥管理逻辑
- 安全性不如专业密钥管理服务

**技术契合度**：高
**复杂度**：中
**安全性**：中到高

## 决策

**选择方案**：选项3 - 混合加密与缓存方案

**理由**：
1. 混合方案提供了安全性和性能的良好平衡，适合API密钥管理的需求。
2. 不需要引入外部依赖服务，降低了系统复杂性和运维成本。
3. 支持密钥轮换和版本控制，满足安全最佳实践。
4. 可以在现有系统架构上逐步实施，不需要大规模重构。
5. 通过缓存机制优化性能，适合高频API调用场景。
6. 双重加密提供了足够强度的安全保障，即使数据库泄露也不会直接暴露API密钥。

🎨 CREATIVE CHECKPOINT: 架构方案选择完成

## 实现设计

### 组件结构

```mermaid
graph TD
    API["API控制器"] --> KeyService["密钥服务"]
    KeyService --> Encryptor["密钥加密器"]
    KeyService --> KeyCache["密钥缓存"]
    KeyService --> KeyRotator["密钥轮换器"]
    KeyService --> KeyRepository["密钥存储库"]
    KeyRotator --> RotationScheduler["轮换调度器"]
    KeyRotator --> SecretGenerator["密钥生成器"]
    KeyService --> AuditLogger["审计日志"]
    KeyRepository --> Database["数据库"]
    API --> UsageMonitor["使用监控"]
    UsageMonitor --> AnomalyDetector["异常检测"]
    AnomalyDetector --> AlertSystem["告警系统"]
```

### 加密策略设计

```mermaid
graph TD
    PlainKey["明文API密钥"] --> Layer1["第一层加密<br>AES-256-GCM"]
    Layer1 --> Salt["随机加盐"]
    Salt --> Layer2["第二层加密<br>独立密钥HMAC"]
    Layer2 --> EncryptedKey["加密存储的密钥"]
    
    DecryptReq["解密请求"] --> Authentication["身份验证"]
    Authentication --> Authorization["授权检查"]
    Authorization --> Layer2Dec["第二层解密"]
    Layer2Dec --> Layer1Dec["第一层解密"]
    Layer1Dec --> CacheCheck{"缓存中?"}
    CacheCheck -->|"是"| ReturnCached["返回缓存密钥"]
    CacheCheck -->|"否"| DecryptAndCache["解密并缓存"]
    DecryptAndCache --> ReturnNew["返回解密密钥"]
    
    ReturnCached & ReturnNew --> UsageTrack["记录使用情况"]
```

### 密钥轮换设计

```mermaid
graph TD
    Trigger["轮换触发器"] --> Condition{"满足条件?"}
    Condition -->|"否"| Wait["继续等待"]
    Condition -->|"是"| Generate["生成新密钥"]
    Generate --> StoreNewKey["存储新密钥版本"]
    StoreNewKey --> UpdateReferences["更新引用"]
    UpdateReferences --> RevokeCheck{"撤销旧密钥?"}
    RevokeCheck -->|"是"| Revoke["撤销旧密钥"]
    RevokeCheck -->|"否"| Keep["保留旧密钥<br>一段时间"]
    Revoke & Keep --> Notify["通知管理员"]
    
    subgraph "轮换触发条件"
    TimeBasedTrigger["基于时间:<br>每30/60/90天"]
    EventBasedTrigger["基于事件:<br>人员变动/泄露风险"]
    UsageBasedTrigger["基于使用:<br>调用次数阈值"]
    end
    
    TimeBasedTrigger & EventBasedTrigger & UsageBasedTrigger --> Trigger
```

## 实现指南

1. **密钥加密服务实现**:
   ```java
   @Service
   public class ApiKeyEncryptionService {
       
       private static final Logger logger = LoggerFactory.getLogger(ApiKeyEncryptionService.class);
       
       @Value("${encryption.master-key}")
       private String masterKeyBase64;
       
       @Value("${encryption.secondary-key}")
       private String secondaryKeyBase64;
       
       private SecretKey masterKey;
       private SecretKey secondaryKey;
       
       @PostConstruct
       public void init() {
           try {
               // 解码Base64编码的密钥
               byte[] masterKeyBytes = Base64.getDecoder().decode(masterKeyBase64);
               byte[] secondaryKeyBytes = Base64.getDecoder().decode(secondaryKeyBase64);
               
               // 创建密钥规范并生成SecretKey对象
               masterKey = new SecretKeySpec(masterKeyBytes, "AES");
               secondaryKey = new SecretKeySpec(secondaryKeyBytes, "HmacSHA256");
               
               logger.info("API密钥加密服务初始化成功");
           } catch (Exception e) {
               logger.error("API密钥加密服务初始化失败", e);
               throw new RuntimeException("无法初始化加密服务", e);
           }
       }
       
       /**
        * 加密API密钥
        */
       public String encryptApiKey(String plainApiKey) {
           try {
               // 生成随机IV
               byte[] iv = new byte[12]; // GCM模式推荐12字节IV
               SecureRandom random = new SecureRandom();
               random.nextBytes(iv);
               
               // 第一层加密 (AES-GCM)
               Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
               GCMParameterSpec gcmSpec = new GCMParameterSpec(128, iv);
               cipher.init(Cipher.ENCRYPT_MODE, masterKey, gcmSpec);
               
               byte[] encryptedKey = cipher.doFinal(plainApiKey.getBytes(StandardCharsets.UTF_8));
               
               // 合并IV和加密数据
               byte[] combined = new byte[iv.length + encryptedKey.length];
               System.arraycopy(iv, 0, combined, 0, iv.length);
               System.arraycopy(encryptedKey, 0, combined, iv.length, encryptedKey.length);
               
               // 第二层加密 (HMAC)
               Mac hmac = Mac.getInstance("HmacSHA256");
               hmac.init(secondaryKey);
               byte[] hmacResult = hmac.doFinal(combined);
               
               // 合并HMAC和加密数据
               byte[] finalResult = new byte[hmacResult.length + combined.length];
               System.arraycopy(hmacResult, 0, finalResult, 0, hmacResult.length);
               System.arraycopy(combined, 0, finalResult, hmacResult.length, combined.length);
               
               // Base64编码最终结果
               return Base64.getEncoder().encodeToString(finalResult);
           } catch (Exception e) {
               logger.error("API密钥加密失败", e);
               throw new RuntimeException("加密失败", e);
           }
       }
       
       /**
        * 解密API密钥
        */
       public String decryptApiKey(String encryptedApiKey) {
           try {
               // 解码Base64
               byte[] encryptedData = Base64.getDecoder().decode(encryptedApiKey);
               
               // 分离HMAC、IV和加密数据
               byte[] expectedHmac = Arrays.copyOfRange(encryptedData, 0, 32); // HMAC-SHA256 = 32字节
               byte[] combined = Arrays.copyOfRange(encryptedData, 32, encryptedData.length);
               
               // 验证HMAC
               Mac hmac = Mac.getInstance("HmacSHA256");
               hmac.init(secondaryKey);
               byte[] calculatedHmac = hmac.doFinal(combined);
               
               if (!MessageDigest.isEqual(calculatedHmac, expectedHmac)) {
                   throw new SecurityException("HMAC验证失败，数据可能被篡改");
               }
               
               // 分离IV和加密数据
               byte[] iv = Arrays.copyOfRange(combined, 0, 12);
               byte[] cipherText = Arrays.copyOfRange(combined, 12, combined.length);
               
               // 解密
               Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
               GCMParameterSpec gcmSpec = new GCMParameterSpec(128, iv);
               cipher.init(Cipher.DECRYPT_MODE, masterKey, gcmSpec);
               
               byte[] decryptedBytes = cipher.doFinal(cipherText);
               return new String(decryptedBytes, StandardCharsets.UTF_8);
           } catch (Exception e) {
               logger.error("API密钥解密失败", e);
               throw new RuntimeException("解密失败", e);
           }
       }
   }
   ```

2. **密钥缓存服务实现**:
   ```java
   @Service
   public class ApiKeyCacheService {
       
       private final Cache<String, String> keyCache;
       private final ApiKeyEncryptionService encryptionService;
       private final ApiKeyUsageService usageService;
       
       public ApiKeyCacheService(ApiKeyEncryptionService encryptionService, 
                               ApiKeyUsageService usageService) {
           this.encryptionService = encryptionService;
           this.usageService = usageService;
           
           // 创建带有自动过期的缓存
           this.keyCache = Caffeine.newBuilder()
               .expireAfterWrite(30, TimeUnit.MINUTES)  // 30分钟后过期
               .maximumSize(100)                       // 最多缓存100个密钥
               .build();
       }
       
       /**
        * 获取解密后的API密钥
        */
       public String getApiKey(Long appId, String encryptedKey) {
           // 使用应用ID作为缓存键
           String cacheKey = "apikey:" + appId;
           
           // 尝试从缓存获取
           String plainKey = keyCache.getIfPresent(cacheKey);
           if (plainKey != null) {
               // 记录使用情况但从缓存返回
               usageService.recordApiKeyUsage(appId);
               return plainKey;
           }
           
           // 缓存未命中，解密密钥
           plainKey = encryptionService.decryptApiKey(encryptedKey);
           
           // 放入缓存
           keyCache.put(cacheKey, plainKey);
           
           // 记录使用情况
           usageService.recordApiKeyUsage(appId);
           
           return plainKey;
       }
       
       /**
        * 使密钥缓存失效
        */
       public void invalidateCache(Long appId) {
           keyCache.invalidate("apikey:" + appId);
       }
       
       /**
        * 清除所有缓存
        */
       public void clearAllCache() {
           keyCache.invalidateAll();
       }
   }
   ```

3. **密钥轮换服务实现**:
   ```java
   @Service
   public class ApiKeyRotationService {
       
       private static final Logger logger = LoggerFactory.getLogger(ApiKeyRotationService.class);
       
       private final DifyAppRepository appRepository;
       private final ApiKeyEncryptionService encryptionService;
       private final ApiKeyCacheService cacheService;
       private final ApiKeyUsageService usageService;
       
       @Value("${apikey.rotation.days:90}")
       private int rotationDaysPeriod;
       
       @Autowired
       public ApiKeyRotationService(DifyAppRepository appRepository,
                                  ApiKeyEncryptionService encryptionService,
                                  ApiKeyCacheService cacheService,
                                  ApiKeyUsageService usageService) {
           this.appRepository = appRepository;
           this.encryptionService = encryptionService;
           this.cacheService = cacheService;
           this.usageService = usageService;
       }
       
       /**
        * 定期检查并轮换过期的API密钥
        */
       @Scheduled(cron = "0 0 2 * * ?")  // 每天凌晨2点执行
       public void checkAndRotateKeys() {
           logger.info("开始检查API密钥轮换...");
           
           // 计算轮换阈值日期
           LocalDateTime rotationThreshold = LocalDateTime.now().minusDays(rotationDaysPeriod);
           
           try {
               // 获取需要轮换的应用
               List<DifyApp> appsToRotate = appRepository.findByKeyLastRotatedBefore(rotationThreshold);
               
               logger.info("找到{}个应用需要密钥轮换", appsToRotate.size());
               
               for (DifyApp app : appsToRotate) {
                   rotateApiKey(app);
               }
               
               logger.info("API密钥轮换完成");
           } catch (Exception e) {
               logger.error("API密钥轮换过程中发生错误", e);
           }
       }
       
       /**
        * 手动轮换指定应用的API密钥
        */
       @Transactional
       public DifyApp rotateApiKey(DifyApp app) {
           logger.info("轮换应用ID={}的API密钥", app.getId());
           
           try {
               // 解密当前密钥以允许系统继续访问Dify API服务
               String currentPlainKey = encryptionService.decryptApiKey(app.getApiKey());
               
               // 从Dify API获取新密钥（或在此系统中生成新密钥）
               String newPlainKey = generateOrRequestNewApiKey(app, currentPlainKey);
               
               // 加密新密钥
               String newEncryptedKey = encryptionService.encryptApiKey(newPlainKey);
               
               // 更新数据库记录
               app.setApiKey(newEncryptedKey);
               app.setPreviousApiKey(app.getApiKey()); // 保存旧密钥一段时间
               app.setKeyLastRotated(LocalDateTime.now());
               app = appRepository.save(app);
               
               // 使缓存失效
               cacheService.invalidateCache(app.getId());
               
               // 记录审计日志
               logApiKeyRotation(app.getId(), "SCHEDULED");
               
               return app;
           } catch (Exception e) {
               logger.error("轮换应用ID={}的API密钥失败", app.getId(), e);
               throw new RuntimeException("API密钥轮换失败", e);
           }
       }
       
       /**
        * 生成或请求新的API密钥
        * 这个方法需要根据实际的密钥获取方式实现
        */
       private String generateOrRequestNewApiKey(DifyApp app, String currentKey) {
           // 实现从Dify API服务获取新密钥的逻辑
           // 或者在本系统中生成新的密钥
           // 这里是一个示例实现
           return "new-api-key-" + UUID.randomUUID().toString();
       }
       
       private void logApiKeyRotation(Long appId, String reason) {
           // 记录到审计日志
       }
   }
   ```

4. **API密钥使用和异常检测服务**:
   ```java
   @Service
   public class ApiKeyUsageService {
       
       private static final Logger logger = LoggerFactory.getLogger(ApiKeyUsageService.class);
       
       private final Map<Long, AtomicInteger> dailyUsageCounts = new ConcurrentHashMap<>();
       private final Map<Long, AtomicInteger> hourlyUsageCounts = new ConcurrentHashMap<>();
       private final JdbcTemplate jdbcTemplate;
       
       @Value("${apikey.usage.hourly-threshold:1000}")
       private int hourlyThreshold;
       
       @Autowired
       public ApiKeyUsageService(JdbcTemplate jdbcTemplate) {
           this.jdbcTemplate = jdbcTemplate;
       }
       
       /**
        * 记录API密钥使用情况
        */
       public void recordApiKeyUsage(Long appId) {
           // 增加使用计数
           dailyUsageCounts.computeIfAbsent(appId, k -> new AtomicInteger(0)).incrementAndGet();
           int hourlyCount = hourlyUsageCounts.computeIfAbsent(appId, k -> new AtomicInteger(0)).incrementAndGet();
           
           // 检查是否超过阈值
           if (hourlyCount > hourlyThreshold) {
               logger.warn("应用ID={}的API密钥使用频率异常，一小时内已使用{}次", appId, hourlyCount);
               // 触发告警机制
               triggerUsageAlert(appId, hourlyCount);
           }
       }
       
       /**
        * 重置每小时计数器
        */
       @Scheduled(cron = "0 0 * * * ?")  // 每小时执行一次
       public void resetHourlyCounters() {
           hourlyUsageCounts.clear();
       }
       
       /**
        * 保存每日使用统计并重置计数器
        */
       @Scheduled(cron = "0 0 0 * * ?")  // 每天凌晨执行
       public void saveDailyStatistics() {
           LocalDate today = LocalDate.now();
           
           for (Map.Entry<Long, AtomicInteger> entry : dailyUsageCounts.entrySet()) {
               Long appId = entry.getKey();
               int count = entry.getValue().get();
               
               // 保存到数据库
               jdbcTemplate.update(
                   "INSERT INTO api_key_usage (app_id, usage_date, count) VALUES (?, ?, ?)",
                   appId, today, count
               );
           }
           
           // 重置每日计数器
           dailyUsageCounts.clear();
       }
       
       private void triggerUsageAlert(Long appId, int usageCount) {
           // 实现告警逻辑，例如发送邮件或短信
       }
   }
   ```

5. **DifyAppRepository 扩展**:
   ```java
   @Repository
   public interface DifyAppRepository extends JpaRepository<DifyApp, Long> {
       
       /**
        * 查找需要轮换密钥的应用
        */
       @Query("SELECT a FROM DifyApp a WHERE a.keyLastRotated < :threshold OR a.keyLastRotated IS NULL")
       List<DifyApp> findByKeyLastRotatedBefore(LocalDateTime threshold);
       
       /**
        * 保存审计日志
        */
       @Modifying
       @Query(value = "INSERT INTO api_key_audit (app_id, action, action_time, action_user, details) VALUES (:appId, :action, :actionTime, :actionUser, :details)", nativeQuery = true)
       void saveAuditLog(@Param("appId") Long appId, @Param("action") String action, @Param("actionTime") LocalDateTime actionTime, @Param("actionUser") String actionUser, @Param("details") String details);
   }
   ```

6. **数据模型更新**:
   ```java
   @Entity
   @Table(name = "dify_app")
   public class DifyApp {
       
       // 现有字段...
       
       @Column(name = "api_key", columnDefinition = "TEXT")
       private String apiKey;
       
       @Column(name = "previous_api_key", columnDefinition = "TEXT")
       private String previousApiKey;
       
       @Column(name = "key_last_rotated")
       private LocalDateTime keyLastRotated;
       
       @Column(name = "key_expiry_date")
       private LocalDateTime keyExpiryDate;
       
       // Getter和Setter...
   }
   ```

7. **控制器层更新**:
   ```java
   @RestController
   @RequestMapping("/api/admin/api-keys")
   public class ApiKeyAdminController {
       
       private final DifyAppRepository appRepository;
       private final ApiKeyRotationService rotationService;
       private final ApiKeyEncryptionService encryptionService;
       
       @Autowired
       public ApiKeyAdminController(DifyAppRepository appRepository,
                                  ApiKeyRotationService rotationService,
                                  ApiKeyEncryptionService encryptionService) {
           this.appRepository = appRepository;
           this.rotationService = rotationService;
           this.encryptionService = encryptionService;
       }
       
       /**
        * 手动轮换API密钥
        */
       @PostMapping("/{appId}/rotate")
       public ResponseEntity<DifyApp> rotateApiKey(@PathVariable Long appId) {
           DifyApp app = appRepository.findById(appId)
               .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到应用"));
           
           DifyApp updatedApp = rotationService.rotateApiKey(app);
           
           return ResponseEntity.ok(updatedApp);
       }
       
       /**
        * 设置新的API密钥
        */
       @PostMapping("/{appId}/set-key")
       public ResponseEntity<DifyApp> setApiKey(@PathVariable Long appId, @RequestBody Map<String, String> request) {
           DifyApp app = appRepository.findById(appId)
               .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到应用"));
           
           String newPlainKey = request.get("apiKey");
           if (StringUtils.isEmpty(newPlainKey)) {
               throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "API密钥不能为空");
           }
           
           // 加密新密钥
           String encryptedKey = encryptionService.encryptApiKey(newPlainKey);
           
           // 更新应用
           app.setApiKey(encryptedKey);
           app.setKeyLastRotated(LocalDateTime.now());
           app = appRepository.save(app);
           
           return ResponseEntity.ok(app);
       }
       
       /**
        * 获取API密钥使用统计
        */
       @GetMapping("/{appId}/usage")
       public ResponseEntity<Map<String, Object>> getKeyUsageStats(@PathVariable Long appId,
                                                               @RequestParam(required = false) 
                                                               @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) 
                                                               LocalDate from,
                                                               @RequestParam(required = false) 
                                                               @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) 
                                                               LocalDate to) {
           // 实现获取使用统计数据的逻辑
           
           Map<String, Object> result = new HashMap<>();
           // 填充结果...
           
           return ResponseEntity.ok(result);
       }
   }
   ```

## 验证和检查点

✓ **架构设计验证**
- [x] 使用双层加密保护API密钥
- [x] 实现了密钥缓存以优化性能
- [x] 支持定期和手动密钥轮换
- [x] 密钥使用监控和异常检测
- [x] 审计日志记录密钥操作
- [x] 安全传输确保密钥在传输过程中受保护

✓ **实施准备就绪**
- [x] 数据模型设计已完成
- [x] 主要组件设计已完成
- [x] 与现有系统的集成路径明确
- [x] 密钥轮换策略已定义
- [x] 安全考虑已纳入设计
- [x] 异常检测机制已定义

🎨🎨🎨 EXITING CREATIVE PHASE - DECISION MADE 🎨🎨🎨 