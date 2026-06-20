import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

/**
 * Vitest 组件测试配置
 *
 * 与 Vite 共用插件和别名配置
 * 运行: npx vitest run
 * 监听: npx vitest
 *
 * 测试文件位置: src/**\/__tests__/*.test.ts
 */
export default defineConfig({
  plugins: [vue()],
  test: {
    // 测试环境
    environment: 'jsdom',
    // 全局设置 (describe/it/expect 无需 import)
    globals: true,
    // 测试文件匹配
    include: ['src/**/__tests__/*.test.ts', 'src/**/*.test.ts'],
    // 排除
    exclude: ['node_modules', 'tests/server'],
    // 清理 mock
    clearMocks: true,
    // 设置文件 (全局 mock/配置)
    setupFiles: [],
  },
  resolve: {
    alias: {
      '/@/': resolve(__dirname, 'src') + '/',
    },
  },
});
