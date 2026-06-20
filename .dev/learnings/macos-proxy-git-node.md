# macOS 系统代理不被 Git/Node.js 自动继承

## 发现日期
2026-06-21

## 问题
macOS 系统代理（System Preferences → Network → Proxies）仅对使用 macOS Network Framework 的应用生效（如 Safari、curl）。Git 和 Node.js 不读取系统代理设置。

## 症状
- `curl https://github.com` → 秒通
- `git clone https://github.com/...` → 超时 75s+
- Claude Code MCP 插件（Node.js HTTP client）→ 连接超时 30s

## 根因
Clash/V2Ray 代理运行在 `127.0.0.1:7891`，但只配置在 macOS 系统层。
Git 和 Node.js 需要显式设置 `HTTP_PROXY` / `HTTPS_PROXY` 环境变量。

## 修复

### Git
```bash
git config --global http.proxy http://127.0.0.1:7891
git config --global https.proxy http://127.0.0.1:7891
```

### Node.js / Claude Code MCP
```bash
export HTTP_PROXY="http://127.0.0.1:7891"
export HTTPS_PROXY="http://127.0.0.1:7891"
```

建议写入 `~/.zshrc` 持久化。

### SSH → HTTPS 重写（无 SSH Key 时）
```bash
git config --global url."https://github.com/".insteadOf "git@github.com:"
```

## 踩坑过程
1. 先以为是 SSH host key 问题 → 添加 known_hosts 后出现 `Permission denied (publickey)`
2. 配了 SSH→HTTPS rewrite 仍然超时 → 发现 git 完全不使用系统代理
3. 最终通过 `scutil --proxy` 发现系统有代理，但 `HTTP_PROXY` 环境变量为空
