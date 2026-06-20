# 测试生成器 (Test Generator)

从现有源码自动生成测试骨架，减少手写成本 60-70%。

## 使用方式

### API 测试生成

```bash
# 从 Controller 生成 Java JUnit + TS API 测试
npx tsx test-generator/api-gen.ts jeecg-boot/jeecg-module-system/jeecg-system-biz/src/main/java/org/jeecg/modules/warehouse/controller/WarehouseController.java

# 仅生成 Java 测试
npx tsx test-generator/api-gen.ts <Controller.java> --java-only

# 仅生成 TS 测试
npx tsx test-generator/api-gen.ts <Controller.java> --ts-only

# 预览不写入
npx tsx test-generator/api-gen.ts <Controller.java> --dry-run
```

### UI 测试生成

```bash
# 从 Vue 页面生成 Vitest 组件测试 + Playwright E2E 测试
npx tsx test-generator/ui-gen.ts jeecgboot-vue3/src/views/warehouse/WarehouseList.vue \
  --data jeecgboot-vue3/src/views/warehouse/warehouse.data.ts \
  --api jeecgboot-vue3/src/views/warehouse/warehouse.api.ts
```

## 输出文件

| 输入 | 输出 |
|------|------|
| `{Entity}Controller.java` | `{Entity}ControllerTest.java` + `{module}.generated.test.ts` |
| `{Page}List.vue` + `{module}.data.ts` | `{Page}.component.generated.test.ts` + `{module}.e2e.generated.test.ts` |

## 设计原则

1. **骨架生成，非零人工** — 生成方法签名、Mock 结构、断言框架，业务值由开发者手工填入
2. **TODO 占位符** — 所有需要人工替换的位置均有明确的 `// TODO:` 标记
3. **保留人工判断** — 不自动推断测试数据（如编码规则），避免生成虚假用例

## 生成流程图

```
Controller.java                .vue + .data.ts + .api.ts
     │                                │
     ▼                                ▼
  api-gen.ts                      ui-gen.ts
     │                                │
     ├── {Entity}ControllerTest.java  ├── {Page}.component.test.ts (Vitest)
     └── {module}.test.ts              └── {module}.e2e.test.ts (Playwright)
```
