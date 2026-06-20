# 测试用例目录

```
test/
├── README.md              # 本文件
├── api/                   # 后端接口测试（快速，3秒跑完全部模块）
│   ├── warehouse.test.ts  # 仓库管理
│   └── _template.test.ts  # 新模块模板
├── smoke/                 # 前端冒烟测试（中速，~5秒/页面）
│   └── run.ts             # 冒烟入口：登录 → 访问页面 → 检查元素 + JS 报错
└── utils/
    └── test-helper.ts     # API 测试公共工具
```

## 测试策略

| 层级 | 工具 | 耗时 | 测什么 |
|------|------|:--:|--------|
| **API** | Node.js + fetch | 3s | 接口正确性：CRUD + 鉴权 + 边界 |
| **冒烟** | Playwright 轻量 | 5s/页 | 页面渲染：表格存在 + 关键词 + 无 JS 报错 |

## 执行方式

```bash
# 全部 API 测试（3 秒）
TEST_TOKEN=*** npx tsx test/api/warehouse.test.ts

# 全部冒烟测试（每页 ~5 秒）
npx tsx test/smoke/run.ts
```

## 为什么不做完整 E2E

- Playwright 完整交互测试慢（每页 30s+），投入产出比低
- 表单填写、下拉选择等交互交给 API 测试覆盖
- 冒烟测试只验证"页面能不能正常渲染"，是性价比最高的前端质量保障
