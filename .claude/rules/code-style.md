# Code Style Rules

This file is always loaded. Covers both Java backend and TypeScript/Vue frontend conventions.

## Java (Backend — jeecg-boot/)

### 命名规范
- 实体类: `Sys` 前缀用于系统实体 (`SysUser`, `SysRole`)，业务实体无前缀
- Controller: 推荐使用纯 `@RestController` + `@RequestMapping` 模式（如 `WarehouseController` / `BsCustomerController`），不强制继承 `JeecgController`
- Service 接口: `I<Entity>Service extends IService<Entity>`
- Service 实现: `<Entity>ServiceImpl extends ServiceImpl<Mapper, Entity>`
- Mapper: `<Entity>Mapper extends BaseMapper<Entity>`
- 字段命名: camelCase（数据库列名 snake_case，MyBatis-Plus 自动映射）

### 包结构
`org.jeecg.modules.<module-name>.{controller,entity,mapper,mapper/xml,service,service/impl,vo}`

### 通用注解
实体类使用: `@Data`, `@EqualsAndHashCode(callSuper = false)`, `@Accessors(chain = true)`, `@TableName`
Controller 使用: `@RestController`, `@RequestMapping`, `@Slf4j`
API 文档: `@Schema` (OpenAPI v3), `@Tag`

### API 响应
统一使用 `Result<T>` (来自 `org.jeecg.common.api.vo.Result`):
- `Result.OK(data)` / `Result.OK(msg, data)` — 成功
- `Result.error(msg)` — 失败

### 修改痕迹注释
所有新增或修改的 Java 代码必须用以下注释包裹:
```java
//update-begin---author:作者 ---date:YYYY-MM-DD  for：【bug号/需求号】修改说明-----------
// 修改的代码
//update-end---author:作者 ---date:YYYY-MM-DD  for：【bug号/需求号】修改说明-----------
```
用户未提供 bug 号时需主动询问。

**新增文件**：在文件头（package 声明前）加 begin，文件尾加 end，包裹整个文件。
**新增方法**：begin 在方法声明前，end 在方法 `}` 后。
**修改已有代码**：只包裹被修改的代码段，不包裹整个方法。

### 查询构建
使用 `QueryGenerator.initQueryWrapper(entity, request.getParameterMap())` 自动构建查询条件。

---

## TypeScript / Vue (Frontend — jeecgboot-vue3/)

### 命名规范
- 变量/函数: camelCase
- 组件/类型: PascalCase
- 文件: kebab-case 或 camelCase（遵循现有约定）

### 导入顺序
外部包 → 内部模块 → 相对导入。使用 `/@/` 路径别名（带前导斜杠）导入 `src/` 下文件。

### 组件注册
- Ant Design Vue 组件由 `unplugin-vue-components` 自动按需导入，无需手动 import
- 全局组件在 `registerGlobComp.ts` 注册
- 第三方组件在 `registerThirdComp.ts` 注册
- 重型组件使用 `createAsyncComponent.tsx` 异步加载

### 性能规则
- 非关键模块使用动态 `import()` 延迟加载，禁止在文件顶部静态 import 重型依赖
- 大型依赖链会阻塞首页加载

### API 调用
使用 `defHttp` (自定义 Axios 实例) 发起请求。响应格式 `{ code, result, message, success }`，`code === 200` 判定成功。

### Prettier 配置
150 字符宽，单引号，尾逗号 (es5)，2 空格缩进，`vueIndentScriptAndStyle: true`。

### 函数长度
函数应控制在 20 行以内；当逻辑在 3 个以上调用点复用时提取为独立函数。
