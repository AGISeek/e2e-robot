/**
 * Jest 配置文件
 */

import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // 提供 Next.js 应用的路径，以加载 next.config.js 和 .env 文件
  dir: './',
});

// Jest 的自定义配置
const config: Config = {
  // 覆盖率收集
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/stories/**',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
  ],

  // 测试环境
  testEnvironment: 'jsdom',

  // 模块路径映射
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],

  // 忽略的测试文件
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
    '<rootDir>/dist/',
  ],

  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/setup.ts'],

  // 模块文件扩展名
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // 转换忽略
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],

  // 全局变量
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },

  // 模拟
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // 测试超时
  testTimeout: 10000,

  // 详细输出
  verbose: true,

  // 监听模式设置
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/coverage/',
  ],
};

// 创建 Jest 配置
export default createJestConfig(config);