#!/bin/bash
# JeecgBoot 后端一键重启脚本
# 用法: ./restart-backend.sh

set -e

JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17}"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🛑 停止旧进程..."
lsof -ti:8080 | while read pid; do
  comm=$(ps -p $pid -o comm= 2>/dev/null)
  if [ "$comm" = "java" ]; then
    kill $pid 2>/dev/null && echo "  已停止 PID=$pid"
  fi
done
sleep 2

echo "🔨 编译 + 启动 (级联编译依赖模块)..."
export JAVA_HOME="$JAVA_HOME"
export PATH="$JAVA_HOME/bin:$PATH"

cd "$PROJECT_DIR/jeecg-boot/jeecg-module-system/jeecg-system-start"
mvn spring-boot:run -am > /tmp/jeecg-boot.log 2>&1 &

echo "⏳ 等待启动..."
for i in $(seq 1 60); do
  sleep 2
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/jeecg-boot/sys/login 2>/dev/null | grep -q '2\|3\|4'; then
    echo ""
    echo "✅ 启动成功！ http://localhost:8080/jeecg-boot"
    exit 0
  fi
  echo -n "."
done

echo ""
echo "⚠️  超时，检查日志: tail -f /tmp/jeecg-boot.log"
