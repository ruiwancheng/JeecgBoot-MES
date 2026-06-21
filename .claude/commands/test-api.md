# Test API (后端接口测试)

后端 REST API 分层测试。支持 Java JUnit + TS HTTP 两种模式。

## Process

### Step 0: 收集目标模块

- 提示用户输入模块名或 Entity 名
- 用户输入具体名称 → 进入 Step 1

### Step 1: 检查测试用例是否存在

```bash
# Java 测试 (在 jeecg-system-start 模块)
find jeecg-boot/jeecg-module-system/jeecg-system-start/src/test -name "*{Entity}*Test.java"

# TS API 测试
ls test/api/{module}.test.ts
```

- **存在** → 直接执行 Step 3
- **不存在** → 进入 Step 2 自动生成

### Step 2: 自动生成 API 测试

```bash
# 从 Controller 生成 (同时产出 Java + TS)
npx tsx test-generator/api-gen.ts path/to/{Entity}Controller.java
```

生成产物：
- `*ControllerTest.java` — JUnit @WebMvcTest 骨架（15+ 用例）
- `{module}.generated.test.ts` — TS HTTP 测试骨架

**Java 测试核心结构（@WebMvcTest + @MockBean）：**

```java
@WebMvcTest({Entity}Controller.class)
class {Entity}ControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean I{Entity}Service service;
    @MockBean BaseCommonService baseCommonService;   // 基础设施 Mock
    @MockBean RedisUtil redisUtil;
    @MockBean JeecgRedisClient jeecgRedisClient;
    @MockBean JeecgBaseConfig jeecgBaseConfig;

    // 覆盖: list / add / edit / delete / queryById / deleteBatch / 边界
}
```

**TS 测试必须包含字典翻译验证：**

```typescript
import { assertDictText } from '../utils/test-helper'; // 或内联 assertDictText

// 新增后验证
assertDictText(record, 'type_dictText', '预期中文值');
```

### Step 3: 执行

```bash
# Java JUnit
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
mvn test -DskipTests=false -pl jeecg-module-system/jeecg-system-start -Dtest={Entity}ControllerTest

# TS API
export TEST_TOKEN="<token>"  # 或脚本自动获取
npx tsx test/api/{module}.test.ts

# 或一键
./test/run-all.sh {module} api
```

### Step 4: 输出报告

```
## API 测试报告 — {module}

| # | 测试用例 | 层级 | 结果 |
|---|---------|------|:--:|
| 1 | 未登录鉴权 401 | Java | ✅ |
| 2 | 分页列表查询 | Java | ✅ |
| 3 | 新增 | Java | ✅ |
| ... | 字典翻译验证 | TS | ✅ |

通过: X  失败: X
```

## 关键约定

- 测试类放在 `jeecg-system-start/src/test/`（非 `-biz`）
- 使用 `@WebMvcTest`（非 `@SpringBootTest`），启动快 10 倍
- 必须 Mock `BaseCommonService` / `RedisUtil` / `JeecgRedisClient` / `JeecgBaseConfig`
- 字典字段必须验证 `_dictText` 值（防编码乱码）
- Maven: `-DskipTests=false` 必须显式传入
