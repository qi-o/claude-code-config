# Agent Size Budget

## Core Principle

预防性上下文治理：在文件写入时限制尺寸，而非在上下文耗尽时才降级。
与 context-budget.md（反应式 % 分层）互补。

## 行数预算

| 层级 | 最大行数 | 适用场景 |
|------|---------|---------|
| XL   | 1600    | 核心系统指令（CLAUDE.md、AGENTS.md） |
| L    | 1000    | 主要 skill 文件、核心 rules |
| Default | 500  | 标准 skill、一般 rules |
| Micro | 200    | 辅助脚本、配置片段 |

## 判定规则

1. `CLAUDE.md` / `AGENTS.md` → XL
2. `SKILL.md`（含 workflow + hooks） → L
3. `rules/*.md` / 单一职责 skill → Default
4. `scripts/` 下的辅助说明 → Micro

## 超标处理

- 写入前检查行数
- 超标时拆分为：主文件 + references/*.md
- 拆分后主文件 ≤ 目标层级的 80%

## 与 context-budget.md 的关系

| 规则 | 作用时机 | 机制 |
|------|---------|------|
| agent-size-budget | 写入时 | 预防性行数限制 |
| context-budget.md | 运行时 | 反应式上下文降级 |
