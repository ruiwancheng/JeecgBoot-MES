---
glob: **/auth/**, **/*.sql, **/api/**, **/controller/**, **/mapper/**, **/middleware/**, **/*.xml, **/jeecg-boot-base-core/**
---

## Security Rules

### 配置文件
- 永远不要修改 `.env`、`application-*.yml`、`settings.json` 等配置文件，除非用户明确要求
- 不要将密钥、Token、密码写入代码或注释

### Git 操作
- 禁止 `git push --force`（除非用户明确要求）
- 禁止 `git reset --hard`（需要显式批准）

### SQL 安全
- 使用 MyBatis-Plus 参数化查询（`#{}` 占位符）——禁止字符串拼接 SQL
- 禁止 `DROP TABLE`、禁止不带 `WHERE` 的 `DELETE FROM`
- XML Mapper 中关注 `${}` (字符串替换) 使用场景，确保不会注入

### 认证与授权
- 所有增删改接口必须经过 Shiro 认证和权限检查
- Controller 方法使用 `@RequiresPermissions` 或 `@RequiresRoles` 注解
- 不要在生产代码中绕过 `JeecgController` 基类的权限检查机制

### 输入验证
- 前端校验（`dynamicRules`）为第一道防线
- 后端建议补充 `@Valid` / `@Validated` + JSR-303 注解（当前 JeecgBoot 代码生成器模板未默认包含，需手动添加）
- 防止 XSS：前端 `xss` 包过滤用户输入

### 依赖管理
- 不要添加新依赖而不说明原因
- Maven: 新依赖需在 parent pom 的 `<dependencyManagement>` 中声明版本
- 前端: 新依赖需用户确认
