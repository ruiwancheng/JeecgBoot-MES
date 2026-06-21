# Test All (前后端全量测试)

前后端分层测试入口。L1(API) → L2(组件) → L3(E2E) 逐层执行。

## Process

### Step 0: 收集目标模块

- 提示用户输入模块名（如「仓库」「客户」）
- 用户不输入或输入「全部」→ 运行所有已有测试
- 用户输入具体模块名 → 进入 Step 1

### Step 1: 检查测试用例是否存在

```
test/api/{module}.test.ts                          # L1 TS API 测试
jeecg-boot/.../jeecg-system-start/src/test/**/*{Entity}*Test.java  # L1 Java 测试
jeecgboot-vue3/src/views/{module}/__tests__/*.test.ts              # L2 组件测试
test/e2e/{module}.test.ts                          # L3 E2E 测试
```

- **存在** → 直接执行 Step 2
- **不存在** → 进入 Step 1.5

### Step 1.5: 自动生成测试骨架

**优先使用生成器，再手工补值：**

```bash
# 从 Controller 生成 API 测试骨架 (JUnit + TS)
npx tsx test-generator/api-gen.ts path/to/XxxController.java

# 从 Vue 页面生成 UI 测试骨架 (Vitest + E2E)
npx tsx test-generator/ui-gen.ts path/to/XxxList.vue --data path/to/data.ts --api path/to/api.ts
```

生成后按 `test-templates/` 中的模板规范补充业务值（如测试编码、预期字典文本）。

### Step 2: 一键分层执行

```bash
# 一键三层全跑
./test/run-all.sh {module}

# 仅某层
./test/run-all.sh {module} api
./test/run-all.sh {module} ui
./test/run-all.sh {module} e2e
```

脚本自动完成：
- 后端/前端可达性检查
- Java: `mvn test -DskipTests=false -pl jeecg-module-system/jeecg-system-start -Dtest=...`
- Vitest: `npx vitest run --config vitest.config.ts`
- Playwright: `npx playwright test test/e2e/{module}.test.ts`
- 自动获取 JWT Token（从登录接口）

### Step 3: 汇总报告

```
## 测试报告 — {module}

| 层级 | 工具 | 用例数 | 通过 | 失败 |
|------|------|--------|------|------|
| L1 API (Java) | JUnit @WebMvcTest | X | X | X |
| L1 API (TS) | TS HTTP | X | X | X |
| L2 组件 | Vitest | X | X | X |
| L3 E2E | Playwright | X | X | X |
| 合计 | | X | X | X |
```

## 测试金字塔策略

```
         ┌──────────┐
         │  L3 E2E  │  Playwright · 5-8 关键路径 · ~60s
         ├──────────┤
         │  L2 组件  │  Vitest · 10-15 交互/校验 · ~10s
         ├──────────┤
         │  L1 API  │  JUnit + TS · 15-20 CRUD/边界 · ~5s
         └──────────┘
```

- L1 覆盖所有 CRUD + 鉴权 + 边界 + 字典翻译
- L2 覆盖表单渲染/校验/提交/编辑回显
- L3 仅覆盖不可回退的关键用户旅程
