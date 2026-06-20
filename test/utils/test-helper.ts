/**
 * 测试公共工具函数
 *
 * Token 获取方式（二选一）：
 *   1. 环境变量: export TEST_TOKEN="xxx"
 *   2. 浏览器登录后 F12 → Network → 复制 X-Access-Token
 */

const BASE_URL = 'http://localhost:8080/jeecg-boot';

/** 从环境变量读取 token */
export function getToken(): string {
  const token = process.env.TEST_TOKEN;
  if (!token) {
    throw new Error(
      '请先设置 TEST_TOKEN 环境变量:\n' +
      '  export TEST_TOKEN="<从浏览器 F12 → Network → X-Access-Token 复制>"'
    );
  }
  return token;
}

// ============================================================
// HTTP 请求封装
// ============================================================

interface RequestOptions {
  token?: string;
  body?: any;
}

async function request(method: string, path: string, options: RequestOptions = {}) {
  const { token, body } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['X-Access-Token'] = token;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json() as any;
}

export function get(path: string, token?: string) {
  return request('GET', path, { token });
}

export function post(path: string, body: any, token?: string) {
  return request('POST', path, { token, body });
}

export function put(path: string, body: any, token?: string) {
  return request('PUT', path, { token, body });
}

export function del(path: string, token?: string) {
  return request('DELETE', path, { token });
}

// ============================================================
// 断言辅助
// ============================================================

export function assertSuccess(result: any, msg?: string) {
  if (!result.success || result.code !== 200) {
    throw new Error(msg || `API 返回失败: ${JSON.stringify(result)}`);
  }
}

export function assertFail(result: any, expectedCode?: number) {
  if (result.success) throw new Error('应返回失败');
  if (expectedCode && result.code !== expectedCode) {
    throw new Error(`期望错误码 ${expectedCode}，实际 ${result.code}`);
  }
}
