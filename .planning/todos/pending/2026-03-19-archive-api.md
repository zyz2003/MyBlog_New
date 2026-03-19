---
created: 2026-03-19T00:00:00.000Z
title: 文章归档 API（按年/月归档统计）
area: api
files: []
---

## Problem

Phase 4 讨论中识别出文章归档功能的需求：

- 按年份和月份归档文章
- 统计每月的文章数量
- 用于侧边栏或归档页面展示

当前 Phase 4 主要关注基础 CRUD API，归档功能可以在后续实现，但不能忘记这个需求。

## Solution

实现归档统计 API：

- `GET /api/v1/archive` — 返回按年/月分组的文章统计
- 响应格式：`{ success: true, data: [{ year: 2024, month: 3, count: 5 }, ...] }`
- 支持 `?year=2024` 参数筛选特定年份

可以延迟到 Phase 6（前台博客）时一起实现，因为归档主要用于前台展示。
