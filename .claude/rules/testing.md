---
glob: **/*.test.*, **/__tests__/**, **/*Test.java, **/*.spec.*
---

## Testing Rules

- Follow the **Arrange / Act / Assert** pattern
- Test the behavior, not the implementation — avoid mocking internals
- Each test should be independent and idempotent
- Name tests descriptively: `should [expected behavior] when [condition]`
- Never commit `.only()` or `.skip()` — they disable other tests silently
- Run the full related test suite before claiming work is done

### 测试金字塔（3 层）

```
L1: API 测试 (JUnit @WebMvcTest + TS HTTP) — 15-20 个/模块, ~5s
L2: 组件测试 (Vitest) — 10-15 个/模块, ~10s
L3: E2E 冒烟 (Playwright) — 5-8 个关键路径, ~60s
```

### Java (JUnit 5)

```bash
# 单个测试类 (必须加 -DskipTests=false)
mvn test -DskipTests=false -pl jeecg-module-system/jeecg-system-start -Dtest=<TestClassName>

# 一键分层运行
./test/run-all.sh <模块名> api
```

- 使用 JUnit 5 (`org.junit.jupiter.api`) — Spring Boot 3.x 项目
- 测试类放在 `jeecg-system-start/src/test/java/`（非 -biz，@WebMvcTest 需 @SpringBootConfiguration）
- 使用 `@WebMvcTest` + `@MockBean`（非 `@SpringBootTest`），启动快 10 倍
- 必须 Mock 基础设施 Bean: `BaseCommonService`, `RedisUtil`, `JeecgRedisClient`, `JeecgBaseConfig`
- Maven surefire 默认 `<skipTests>true</skipTests>`，必须传 `-DskipTests=false`
- 模块 pom 中覆写 `<skipTests>${skipTests}</skipTests>` 使命令行参数生效

### TypeScript API 测试

```bash
export TEST_TOKEN="<token>"
npx tsx test/api/<module>.test.ts
```

- 测试文件在 `test/api/` 目录
- 使用 `test/utils/test-helper.ts` 的 HTTP 封装
- **必须包含字典翻译验证**：`assertDictText(record, 'field_dictText', '预期中文')`

### Vue 组件测试 (Vitest)

```bash
npx vitest run --config vitest.config.ts
```

- 测试文件在 `src/views/{module}/__tests__/*.test.ts`
- 配置文件：`jeecgboot-vue3/vitest.config.ts`
- 当前策略：验证 data.ts schema + api.ts 端点（不 mount 复杂 Vue 组件）
- 后续增强：加入真正的 Vue SFC mount 测试

### E2E 测试 (Playwright)

```bash
npx playwright test test/e2e/<module>.test.ts
```

- 测试文件在 `test/e2e/`
- 配置文件：根目录 `playwright.config.ts`
- 仅覆盖 5 个关键用户旅程，不搞全量 UI 测试

### 一键运行

```bash
./test/run-all.sh <模块名>          # 三层全跑
./test/run-all.sh <模块名> api      # 仅 L1
./test/run-all.sh <module> ui       # 仅 L2
./test/run-all.sh <module> e2e      # 仅 L3
```

脚本自动完成：服务可达性检查、Token 获取、测试执行、汇总报告。

### 自动生成

```bash
# Controller → JUnit + TS 测试骨架
npx tsx test-generator/api-gen.ts path/to/XxxController.java

# Vue 页面 → Vitest + E2E 测试骨架
npx tsx test-generator/ui-gen.ts path/to/XxxList.vue --data path/to/data.ts --api path/to/api.ts
```

模板位于 `test-templates/` 目录，开发者填入业务值即可运行。
