# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> 除非用户明确要求其他语言，否则始终使用简体中文回答。

## 项目概览

JeecgBoot 3.9.2 — 企业级 AI 低代码平台，支持"低代码 + 零代码"双模式。前后端分离架构，默认单体部署，可选 Spring Cloud 微服务模式。

## Core Rules (Always Apply)

1. **Read First**: 修改代码前先读子项目的 `CLAUDE.md` 和相关源码——后端读 `jeecg-boot/CLAUDE.md`，前端读 `jeecgboot-vue3/CLAUDE.md`
2. **Plan First**: 复杂任务使用 `/start-task` 编写 Sprint Contract，获得用户批准后再编码
3. **Review After**: 完成每个功能单元后运行 `/review` 自查
4. **Session Wrap**: 会话结束前运行 `/session-wrap` 记录进度、沉淀经验
5. **Ask Before Breaking**: API 变更、新增依赖、非预期文件修改需先征求用户决定
6. **Update Markers**: 所有后端 Java 代码修改必须用 `update-begin`/`update-end` 注释包裹

## Custom Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/start-task` | Plan → Sprint Contract → Approval | Starting new work |
| `/review` | Self-check + verification | Before claiming done |
| `/session-wrap` | Pattern discovery → harness improvement | End of session |

## 项目结构

```
JeecgBoot-main/
├── jeecg-boot/          # Java 后端 — Spring Boot 3.5.5 + Java 17 + Maven
│   └── CLAUDE.md        #     详细的后端架构、命令、模块说明
├── jeecgboot-vue3/      # Vue3 前端 — Vite 6 + Ant Design Vue 4 + TypeScript
│   └── CLAUDE.md        #     详细的前端架构、命令、路径别名说明
└── README-AI.md         # AIGC 应用平台功能介绍
```

**重要**: 每个子项目都有独立的 `CLAUDE.md`，包含该子项目的完整构建命令、模块架构、代码规范。处理后端代码时务必先读 `jeecg-boot/CLAUDE.md`，处理前端代码时务必先读 `jeecgboot-vue3/CLAUDE.md`。

## 快速启动

### 后端
```bash
cd jeecg-boot
mvn clean package -DskipTests
cd jeecg-module-system/jeecg-system-start
mvn spring-boot:run
# 访问: http://localhost:8080/jeecg-boot
```

### 前端
```bash
cd jeecgboot-vue3
pnpm dev
# 访问: http://localhost:3100
```

### 前置依赖
- **后端**: JDK 17+, MySQL 8.0+, Redis
- **前端**: Node 18+, pnpm

## 技术栈速览

| 层级 | 技术 |
|------|------|
| 后端框架 | Spring Boot 3.5.5, Spring Cloud 2025.0.0（可选） |
| ORM | MyBatis-Plus 3.5.12 |
| 认证 | Apache Shiro 2.0.5 + JWT + Redis |
| 数据库 | MySQL（默认），兼容 PostgreSQL/Oracle/DM8/KingBase |
| 数据库迁移 | Flyway |
| 前端框架 | Vue 3 + Vite 6 + Ant Design Vue 4 + Pinia |
| 包管理 | pnpm |
| API 文档 | Knife4j 4.5.0 (OpenAPI v3) |

## AI Skills 系统

JeecgBoot 的 Skills 系统支持通过自然语言完成各种低代码操作。每个 Skill 对应一个领域的完整生命周期管理：

| Skill | 用途 |
|-------|------|
| `jeecg-codegen` | 代码生成器——创建模块、增删字段、生成 CRUD 代码 |
| `jeecg-bpmn` | BPMN 工作流——设计 Flowable 审批流程、创建 OA 应用 |
| `jeecg-desform` | 表单设计器——拖拽式表单创建与管理 |
| `jeecg-onlform` | Online 表单——元数据驱动在线表单配置 |
| `jeecg-aiflow` | AI 流程编排——LLM 工作流创建与管理 |
| `jeecg-system` | 系统主数据——用户、角色、部门、字典查询与管理 |
| `jimureport` | 积木报表——可视化报表与打印报表设计 |
| `jimubi-bigscreen` | 大屏设计——数据可视化大屏 |
| `jimubi-dashboard` | 仪表盘——数据看板设计 |
| `jeecg-onlchart` | Online 图表——SQL 驱动的统计图表 |
| `jeecg-onlreport` | Online 报表——SQL 驱动的数据报表 |

**触发规则**: 用户提及任何相关关键词时，必须使用 `Skill` 工具调用对应 Skill。

## 跨端通用约定

### API 响应格式
前后端统一使用 `Result<T>` 结构：
```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "result": { ... }
}
```
- 前端 `code === 200` 判定成功
- 后端使用 `Result.OK(data)` / `Result.error(msg)`

### 代码修改痕迹注释（仅后端 Java 代码）

所有后端 Java 代码的新增或修改必须用以下注释包裹：
```java
//update-begin---author:作者 ---date:YYYY-MM-DD  for：【bug号/需求号】修改说明-----------
// 修改的代码
//update-end---author:作者 ---date:YYYY-MM-DD  for：【bug号/需求号】修改说明-----------
```
- 新增方法：包裹整个方法（begin 在方法声明前，end 在方法 `}` 后）
- 修改方法内代码：只包裹被修改的代码段
- 用户未提供 bug 号时需主动询问

### 权限模式
前端从后端动态拉取路由和菜单（`BACK` 权限模式）。处理权限相关问题时，需同时关注后端角色/权限配置和前端路由加载逻辑。

## 关键配置文件位置

| 文件 | 说明 |
|------|------|
| `jeecg-boot/jeecg-module-system/jeecg-system-start/src/main/resources/application-dev.yml` | 后端开发环境配置 |
| `jeecg-boot/jeecg-module-system/jeecg-system-start/src/main/resources/application.yml` | 后端主配置 |
| `jeecg-boot/jeecg-module-system/jeecg-system-start/src/main/resources/flyway/sql/mysql/` | Flyway 增量迁移脚本 |
| `jeecgboot-vue3/.env.development` | 前端开发环境变量 |
| `jeecgboot-vue3/vite.config.ts` | Vite 构建配置 |

## Online 低代码模块

Online 模块采用元数据驱动架构，通过数据库配置表（`onl_cgform_*`）实现运行时 CRUD，无需生成代码。配置存储在数据库中，Claude Code 无法直接读取，需用户提供 JSON 导出或截图。详细的 Schema、控件类型、增强机制见 `jeecg-boot/CLAUDE.md`。

## 注意事项

- 后端使用 `jakarta` 命名空间（Spring Boot 3.x），不是 `javax`
- 前端 `@jeecg/online` 和 `@jeecg/aiflow` 是外部 CJS 包，已从 Vite 预构建中排除
- 前端使用 `/@/` 路径别名（带前导斜杠）导入 `src/` 下的文件
- 后端支持国产数据库（达梦 DM8、人大金仓 KingBase），驱动已包含在 pom 中
