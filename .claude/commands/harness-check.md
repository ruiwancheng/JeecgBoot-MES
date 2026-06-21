# Harness Check

审计当前项目的 AI harness 配置质量。定期运行或在新模块上线后触发。

## Process

### Step 1: 文件清单审计

```bash
find .claude -type f | sort
```

检查项：
- [ ] `settings.json` — 权限模式和 PreToolUse hook 是否正常
- [ ] `settings.local.json` — allow 规则是否精简（≤30 条）？有无针对特定 PID/URL 的过期规则？
- [ ] `rules/` — 3 个规则文件 (`code-style.md`, `security.md`, `testing.md`) —— 内容是否过时？
- [ ] `commands/` — 命令是否与实际工具对齐？
- [ ] `memory/features.json` — 是否与当前模块清单一致？

### Step 2: 规则对齐检查

| 检查项 | 验证方式 |
|--------|---------|
| testing.md 测试路径 | 与实际 `src/test/` / `__tests__/` 目录对比 |
| testing.md 测试工具 | jest → vitest？路径是否过时？ |
| code-style.md Controller 描述 | 与实际 Controller 模式对比 |
| code-style.md update-begin/end | 新文件是否有标记？ |
| security.md 输入校验 | @Valid 是否在代码生成模板中？ |
| security.md 依赖管理 | 新依赖是否声明在 parent pom？ |

### Step 3: 工具链对齐检查

- [ ] `test/run-all.sh` — 路径是否仍是有效的？
- [ ] `test-generator/` — 生成器是否与当前 Controller/Vue 模式一致？
- [ ] `test-templates/` — 模板是否反映最新实践（如 assertDictText）？
- [ ] `playwright.config.ts` — 是否存在？配置是否正确？
- [ ] `vitest.config.ts` — 是否存在？配置是否正确？
- [ ] `restart-backend.sh` — 是否存在？启动命令是否正确（`-am`）？

### Step 4: 输出报告

```
## Harness 健康报告

| 维度 | 状态 | 问题 |
|------|:----:|------|
| settings | ✅ | — |
| rules | ✅ | — |
| commands | ✅ | — |
| memory | ✅ | — |
| 工具链 | ✅ | — |

### 待优化
- [item]
```

### Step 5: 修复建议

对每个问题给出具体修复方案，优先修复 🔴 项。

## 触发时机

- 每次 `/session-wrap` 自动触发
- 每次新模块上线后手动触发
- 发现重复性踩坑时手动触发
