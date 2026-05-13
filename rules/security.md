# Security Rules

## Mandatory Checks Before Commit

- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] User input is validated
- [ ] SQL queries use parameterized statements
- [ ] HTML output is sanitized (XSS prevention)
- [ ] CSRF protection is enabled
- [ ] Authentication/authorization verified
- [ ] Rate limiting on endpoints
- [ ] Error messages don't expose sensitive data

## Secret Management

❌ Wrong:
```javascript
const apiKey = "sk-proj-xxxxx"
```

✅ Correct:
```javascript
const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) throw new Error("OPENAI_API_KEY not configured")
```

## Package Legitimacy Gate (from GSD v1.42.0 #3215)

AI 推荐的包可能是幻觉产物（slopsquatting）。安装前必须验证包在 registry 中真实存在。

### 验证规则

1. **推荐包时必须做 registry 检查**：
   - npm: `npm view <package>` 确认存在
   - pip: `pip index versions <package>` 确认存在
   - 如有 `slopcheck` 工具可用，优先使用
2. **可疑或未验证的包标记为 `assumed`**，并在计划中添加 human-verification checkpoint
3. **失败的包安装不自动重试** — 直接报错，由用户决定下一步（与 deviation-handling.md Rule 3 互补：包安装失败是信号，不是可自动解决的临时问题）
4. **降级处理**：`slopcheck` 不可用时，所有 AI 推荐的包默认视为 `assumed`，需要人工确认后才可安装

### 红旗信号

| 信号 | 处理 |
|------|------|
| `npm view` 返回 404 | 禁止安装，报告用户 |
| 包名看起来合理但 registry 查不到 | 标记 assumed，要求人工验证 |
| 安装失败（网络除外） | 不重试，报错并标记 |
| 包存在但几乎无下载量 | 标记 assumed，建议用户审查 |

## Security Response Protocol

When security issue discovered:
1. STOP work immediately
2. Use security-reviewer agent
3. Fix critical issues before proceeding
4. Rotate any compromised secrets
5. Review codebase for similar vulnerabilities
