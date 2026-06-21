# JeecgBoot 开发模式记录

**Date**: 2026-06-21

## 后端重启正确姿势

```bash
# ❌ 错误：从根目录执行，不编译依赖
mvn spring-boot:run -pl jeecg-module-system/jeecg-system-start -f pom.xml

# ✅ 正确：从 start 目录执行 + -am 级联编译
cd jeecg-module-system/jeecg-system-start
mvn spring-boot:run -am
```

## Flyway 版本兼容性

- Spring Boot 3.5.5 + Flyway 7.15.0 → ❌ 不兼容
- Spring Boot 3.5.5 + Flyway 11.7.2 → ❌ `placeholderSeparator` 方法不存在
- Spring Boot 3.5.5 + Flyway 10.22.0 → ✅ 兼容

## Maven Surefire 测试跳过

父 pom 有 `<skipTests>true</skipTests>` 硬编码，命令行 `-DskipTests=false` 不生效。
修复：在模块 pom 中覆写 `<skipTests>${skipTests}</skipTests>`。

## @WebMvcTest 的 @SpringBootConfiguration

@WebMvcTest 测试必须放在 jeecg-system-start 模块，因为 @SpringBootApplication 在这里。
放在 jeecg-system-biz 模块会报 "Unable to find @SpringBootConfiguration"。

## 字典编码乱码检测

字典 `_dictText` 的 UTF-8 编码问题可以通过 `assertDictText()` 自动检测：
- 精确匹配期望中文值
- 检测 `å¤©` 等 Latin-1 误解码特征字符

## MySQL 数据直接修复

Flyway disabled 时，用 `UNHEX()` 写入正确的 UTF-8 字节：
```sql
UPDATE sys_dict_item SET item_text = UNHEX('E5AD98E582A8E58CBA') WHERE ...;
```

## Git 提交策略

新项目首次提交时：
- 第一 commit: 原始项目导入
- 后续 commit: 每个功能一个 commit
- 避免 `git add -A` 把所有文件打成一个 commit
