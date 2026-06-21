# JeecgBoot 测试目录

本目录包含 JeecgBoot 的分层测试体系。按测试层级和模块组织。

## 目录结构

```
test/
├── README.md                    ← 你在这里
├── run-all.sh                   # 一键分层运行脚本
│
├── api/                         # L1: TS HTTP API 集成测试
│   └── warehouse.test.ts
│
├── vitest/                      # L2: Vitest 组件单元测试
│   └── warehouse/
│       ├── WarehouseModal.test.ts
│       └── WarehouseLocationModal.test.ts
│
├── e2e/                         # L3: Playwright E2E 冒烟测试
│   └── warehouse.test.ts
│
└── utils/                       # 测试公共工具
    └── test-helper.ts           # HTTP 封装 + 断言辅助
```

## Java 测试

Java JUnit 测试位于后端 Maven 标准目录（Maven 强制要求）：

```
jeecg-boot/jeecg-module-system/jeecg-system-start/src/test/java/
└── org/jeecg/modules/
    └── warehouse/test/
        └── WarehouseControllerTest.java    # 15 用例 @WebMvcTest
```

## 测试金字塔

```
         ┌──────────┐
         │  L3 E2E  │  Playwright · 5-8 关键路径 · ~60s
         ├──────────┤
         │  L2 组件  │  Vitest · 10-15 交互/校验 · ~10s
         ├──────────┤
         │  L1 API  │  JUnit + TS · 15-20 CRUD/边界/字典 · ~5s
         └──────────┘
```

## 快速开始

```bash
# 一键运行仓库模块全部测试
./test/run-all.sh warehouse

# 仅 API 层
./test/run-all.sh warehouse api

# 仅组件层
npx vitest run --config jeecgboot-vue3/vitest.config.ts

# 仅 E2E 层
npx playwright test test/e2e/warehouse.test.ts

# Java 测试
cd jeecg-boot/jeecg-module-system/jeecg-system-start
mvn test -DskipTests=false -Dtest=WarehouseControllerTest
```

## 新建模块测试

```bash
# 自动生成测试骨架
npx tsx test-generator/api-gen.ts path/to/XxxController.java
npx tsx test-generator/ui-gen.ts path/to/XxxList.vue --data path/to/data.ts --api path/to/api.ts

# 手工参考模板
ls test-templates/
```

## 命名规范

| 层级 | 命名 | 示例 |
|------|------|------|
| TS API | `test/api/{module}.test.ts` | `warehouse.test.ts` |
| Vitest | `test/vitest/{module}/{Component}.test.ts` | `warehouse/WarehouseModal.test.ts` |
| E2E | `test/e2e/{module}.test.ts` | `warehouse.test.ts` |
| Java | `*ControllerTest.java` | `WarehouseControllerTest.java` |
