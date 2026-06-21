#!/bin/bash
# ============================================================
# JeecgBoot 分层测试一键运行脚本
#
# 用法:
#   ./test/run-all.sh <模块名> [层级]
#
#   层级可选: all | api | ui | e2e
#   默认: all (三层都跑)
#
# 示例:
#   ./test/run-all.sh warehouse          # 仓库模块三层测试
#   ./test/run-all.sh warehouse api      # 仅 API 测试
#   ./test/run-all.sh warehouse ui       # 仅组件测试
#   ./test/run-all.sh warehouse e2e      # 仅 E2E 测试
#
# 前置条件:
#   - API测试: 后端运行中 (http://localhost:8080)
#   - UI测试:  前端运行中 (http://localhost:3100)
#   - E2E测试:  前后端均运行中
# ============================================================

set -e

MODULE="${1:-}"
LEVEL="${2:-all}"

if [ -z "$MODULE" ]; then
  echo "❌ 请指定模块名"
  echo "   用法: ./test/run-all.sh <模块名> [all|api|ui|e2e]"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17}"
PASS_COUNT=0
FAIL_COUNT=0
TOTAL_COUNT=0

# 颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "============================================================"
echo "  🧪 JeecgBoot 分层测试 — ${MODULE}"
echo "  层级: ${LEVEL}"
echo "============================================================"
echo ""

# ============================================================
# 辅助函数
# ============================================================

check_backend() {
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/jeecg-boot/ 2>/dev/null || echo "DOWN")
  if [ "$HTTP_CODE" = "DOWN" ]; then
    echo -e "${RED}❌ 后端未运行 (http://localhost:8080)${NC}"
    return 1
  fi
  echo -e "${GREEN}✅ 后端运行中${NC}"
  return 0
}

check_frontend() {
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/ 2>/dev/null || echo "DOWN")
  if [ "$HTTP_CODE" = "DOWN" ]; then
    echo -e "${RED}❌ 前端未运行 (http://localhost:3100)${NC}"
    return 1
  fi
  echo -e "${GREEN}✅ 前端运行中${NC}"
  return 0
}

count_result() {
  local exit_code=$1
  local test_name=$2
  TOTAL_COUNT=$((TOTAL_COUNT + 1))
  if [ "$exit_code" -eq 0 ]; then
    PASS_COUNT=$((PASS_COUNT + 1))
    echo -e "${GREEN}✅ ${test_name} — 通过${NC}"
  else
    FAIL_COUNT=$((FAIL_COUNT + 1))
    echo -e "${RED}❌ ${test_name} — 失败${NC}"
  fi
}

# ============================================================
# L1: API 测试 (Java JUnit)
# ============================================================

run_api_tests() {
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  📡 L1: API 测试 (JUnit @WebMvcTest)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  check_backend || return 0

  # Java 测试 (如果存在)
  JAVA_TEST_CLASS="${MODULE^}ControllerTest"
  JAVA_TEST_PATH="$PROJECT_DIR/jeecg-boot/jeecg-module-system/jeecg-system-biz/src/test/java/org/jeecg/modules/${MODULE}/test/${JAVA_TEST_CLASS}.java"

  if [ -f "$JAVA_TEST_PATH" ]; then
    echo "  运行 Java 测试: ${JAVA_TEST_CLASS}..."
    cd "$PROJECT_DIR/jeecg-boot"
    export JAVA_HOME="$JAVA_HOME"
    export PATH="$JAVA_HOME/bin:$PATH"
    mvn test -DskipTests=false -pl jeecg-module-system/jeecg-system-biz -Dtest="${JAVA_TEST_CLASS}" -q 2>&1
    count_result $? "Java: ${JAVA_TEST_CLASS}"
  else
    echo -e "  ${YELLOW}⏭️  跳过 (Java 测试文件不存在)${NC}"
  fi

  # TS API 测试 (如果存在)
  API_TEST="$PROJECT_DIR/test/api/${MODULE}.test.ts"
  if [ -f "$API_TEST" ]; then
    echo "  运行 TS API 测试: test/api/${MODULE}.test.ts..."

    # 尝试获取 token
    if [ -z "$TEST_TOKEN" ]; then
      TOKEN=$(curl -s http://localhost:8080/jeecg-boot/sys/login \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"123456","captcha":"","remember_me":true}' \
        | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['token'])" 2>/dev/null || echo "")
      if [ -n "$TOKEN" ]; then
        export TEST_TOKEN="$TOKEN"
      fi
    fi

    npx tsx "$API_TEST" 2>&1
    count_result $? "TS API: ${MODULE}.test.ts"
  else
    echo -e "  ${YELLOW}⏭️  跳过 (TS API 测试文件不存在)${NC}"
  fi
  echo ""
}

# ============================================================
# L2: 组件测试 (Vitest)
# ============================================================

run_ui_tests() {
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  🧩 L2: 组件测试 (Vitest)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  VITEST_PATH="$PROJECT_DIR/jeecgboot-vue3/vitest.config.ts"
  if [ ! -f "$VITEST_PATH" ]; then
    echo -e "  ${YELLOW}⏭️  跳过 (vitest.config.ts 不存在)${NC}"
    echo ""
    return 0
  fi

  cd "$PROJECT_DIR/jeecgboot-vue3"

  # 检查是否有对应模块的测试文件
  TEST_FILES=$(find "$PROJECT_DIR/test/vitest" -path "*/${MODULE}/*.test.ts" 2>/dev/null || true)
  if [ -z "$TEST_FILES" ]; then
    echo -e "  ${YELLOW}⏭️  跳过 (${MODULE} 模块无 Vitest 测试文件)${NC}"
    echo ""
    cd "$PROJECT_DIR"
    return 0
  fi

  echo "  测试文件:"
  for f in $TEST_FILES; do
    echo "    - $f"
  done

  npx vitest run --config vitest.config.ts 2>&1
  count_result $? "Vitest: ${MODULE}"

  cd "$PROJECT_DIR"
  echo ""
}

# ============================================================
# L3: E2E 冒烟测试 (Playwright)
# ============================================================

run_e2e_tests() {
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  🌐 L3: E2E 冒烟测试 (Playwright)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  check_backend || true
  check_frontend || return 0

  E2E_TEST="$PROJECT_DIR/test/e2e/${MODULE}.test.ts"
  if [ ! -f "$E2E_TEST" ]; then
    echo -e "  ${YELLOW}⏭️  跳过 (test/e2e/${MODULE}.test.ts 不存在)${NC}"
    echo ""
    return 0
  fi

  cd "$PROJECT_DIR"
  echo "  运行 E2E: test/e2e/${MODULE}.test.ts..."
  npx playwright test "$E2E_TEST" 2>&1
  count_result $? "Playwright: ${MODULE}"

  echo ""
}

# ============================================================
# 主流程
# ============================================================

case "$LEVEL" in
  all)
    run_api_tests
    run_ui_tests
    run_e2e_tests
    ;;
  api)
    run_api_tests
    ;;
  ui)
    run_ui_tests
    ;;
  e2e)
    run_e2e_tests
    ;;
  *)
    echo "❌ 无效层级: $LEVEL (可选: all | api | ui | e2e)"
    exit 1
    ;;
esac

# ============================================================
# 汇总报告
# ============================================================

echo "============================================================"
echo "  📊 测试报告"
echo "============================================================"
echo ""

# 使用 printf 对齐
printf "  %-20s %-8s %-8s %-8s\n" "层级" "用例数" "通过" "失败"
printf "  %-20s %-8s %-8s %-8s\n" "--------------------" "--------" "--------" "--------"

# 这里数字是模拟的——实际解析需要更复杂的逻辑
# 后续可增强为从测试输出解析实际数字
printf "  %-20s %-8s %-8s %-8s\n" "L1 API" "-" "-" "-"
printf "  %-20s %-8s %-8s %-8s\n" "L2 组件" "-" "-" "-"
printf "  %-20s %-8s %-8s %-8s\n" "L3 E2E" "-" "-" "-"
printf "  %-20s %-8s %-8s %-8s\n" "--------------------" "--------" "--------" "--------"
printf "  %-20s %-8s %-8s %-8s\n" "合计" "$TOTAL_COUNT" "$PASS_COUNT" "$FAIL_COUNT"

echo ""

if [ "$FAIL_COUNT" -eq 0 ]; then
  echo -e "  ${GREEN}🎉 全部测试通过！${NC}"
else
  echo -e "  ${RED}⚠️  有 ${FAIL_COUNT} 个测试失败，请检查上方输出${NC}"
fi

echo ""
echo "============================================================"
