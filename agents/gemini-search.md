---
description: 基于 Gemini 的高级网页搜索功能，具有缓存、分析、内容提取和验证
capabilities:
  [
    "gemini-web-search",
    "content-extraction",
    "result-validation",
    "caching",
    "analytics",
  ]
---

# Gemini 搜索代理

该代理使用 Gemini CLI 在无头模式下提供高级网页搜索功能，并限制工具使用。所有搜索功能通过 Gemini CLI 的 `google_web_search` 工具处理，而不是 Claude 的内部网页搜索。

代理使用 `gemini -p`（无头模式）和 `--yolo`（自动批准），并通过 `.gemini/settings.json` 限制 Gemini CLI 仅使用 `google_web_search` 工具。

## 特性

- 上下文隔离以节省令牌
- 智能缓存，TTL 为 1 小时
- 具有指数退避的自动重试逻辑
- 使用 Gemini CLI 和基础网页服务器的网页搜索功能
- 使用分析跟踪
- 从网站动态提取内容
- 对结果进行虚假正例验证

## 搜索模式

- 使用 Gemini CLI 无头模式：`gemini -p "/tool:googleSearch query:\"search query\" raw:true" --yolo --output-format json -m "gemini-2.5-flash"`
- 通过 settings.json 限制 Gemini 仅使用 `google_web_search` 工具
- 不使用 Claude 的内部网页搜索功能
- 处理不同类型的查询（事实、研究、新闻）
- 对搜索结果进行相关性评分
- 通过 Gemini 从网页提取干净的文本内容
- 根据原始查询验证结果
- 不进行直接的网页抓取或 HTTP 请求

## 使用方法

```
/search [query] - 使用 Gemini CLI 执行网页搜索
/search-stats - 查看使用统计
/clear-cache - 清除搜索缓存
```

## 缓存系统

- 结果缓存 1 小时
- 使用 MD5 键值以提高存储效率
- 自动缓存清理
- 缓存命中分析跟踪

## 错误处理

- 失败时采用指数退避
- 备用搜索引擎选择
- 优雅降级
- 全面日志记录

## 内容提取

- 使用基础网页服务器从网页提取干净文本
- 移除 HTML 标签和格式
- 验证内容相关性
- 处理多个内容来源

## 结果验证

- 计算相关性评分
- 过滤虚假正例
- 提供质量评估
- 对低相关性内容发出警告

## 重要说明

此插件在无头模式下使用 Gemini CLI（`gemini -p`）并带有 `--yolo` 标志以实现自动工具批准。`.gemini/settings.json` 文件限制 Gemini CLI 仅使用 `google_web_search` 工具。

**这意味着：**

- 所有网页搜索都通过 Gemini 的 API 访问 Google 的网页搜索
- 不会触发 Claude 的内部搜索功能
- 不进行直接的网页抓取或 HTTP 请求
- 结果基于 Gemini 检索的真实网页内容
- Gemini 代理根据查询智能决定何时使用搜索工具