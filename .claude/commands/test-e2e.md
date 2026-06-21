# Test E2E (前端 UI 测试)

前端端到端测试入口。Playwright 驱动，仅覆盖关键用户旅程（5-8 个核心路径）。

## Process

### Step 0: 收集目标页面

- 提示用户输入页面名称
- 用户输入具体页面名 → 进入 Step 1

### Step 1: 检查测试用例是否存在

```bash
ls test/e2e/{module}.test.ts
```

- **存在** → 直接执行 Step 3
- **不存在** → 进入 Step 2

### Step 2: 生成 E2E 测试

**优先用生成器：**

```bash
npx tsx test-generator/ui-gen.ts path/to/XxxList.vue \
  --data path/to/data.ts \
  --api path/to/api.ts
```

**或基于模板手工创建：** 参考 `test-templates/e2e-test.template.ts`

### E2E 覆盖范围（5 个关键路径，不搞全量）

```
1. 【页面渲染】导航后表格 + 按钮可见
2. 【新增流程】打开弹窗 → 填写 → 提交 → 列表刷新
3. 【编辑流程】点击编辑 → 弹窗回显 → 修改 → 提交
4. 【删除流程】点击删除 → 确认弹窗 → 取消
5. 【表单校验】必填为空 → 校验错误提示
```

### Step 3: 执行

```bash
# 前置：前后端运行中，验证码已关闭
npx playwright test test/e2e/{module}.test.ts

# 或一键
./test/run-all.sh {module} e2e
```

`playwright.config.ts` 已配置：
- `testDir: ./test/e2e`
- `headless: true`
- `baseURL: http://localhost:3100`
- `screenshot: only-on-failure`

### Step 4: 输出报告

```
## E2E 测试报告 — {pageName}

| # | 用例 | 结果 |
|---|------|:--:|
| 1 | 页面渲染 | ✅ |
| 2 | 新增流程 | ✅ |
| 3 | 编辑流程 | ✅ |
| 4 | 删除流程 | ✅ |
| 5 | 表单校验 | ✅ |

通过: X  失败: X
```

## 关键约定

- E2E **不覆盖全量 UI** — 只测不可回退的关键路径
- 其他所有场景下沉到 L1 (API) 和 L2 (组件) 测试
- 需要前后端均运行、验证码关闭
- Playwright 配置在项目根 `playwright.config.ts`
