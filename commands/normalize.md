---
argument-hint: [--path=<directory>] [--dry-run]
description: 将代码标准化为可自动化的统一格式
---

# Claude Command: Normalize

将代码标准化为**可自动化的**统一格式。侧重于机器可执行的格式化规则。

## 触发方式

```
/normalize
```

## 执行步骤

### 1. 格式标准化（可自动化）
- 应用 prettier/eslint 格式化规则
- 统一缩进、引号、分号

### 2. Import 标准化（可自动化）
- 统一 import 顺序（内置 → 第三方 → 本地）
- 移除未使用的 import
- 合并分散的 import
- 使用 eslint-plugin-import 自动排序

### 3. 命名标准化（部分可自动化）
- 文件名 → kebab-case 或 PascalCase
- 类名 → PascalCase
- 函数/变量 → camelCase
- 常量 → UPPER_SNAKE_CASE

### 4. 样式标准化（可自动化）
- CSS 格式化
- 统一颜色/间距单位

## 工具建议

```bash
# 格式标准化
npx prettier --write .
npx eslint --fix .

# Import 排序
npm install -D eslint-plugin-import
```

## 输出

列出所有格式标准化改动。
