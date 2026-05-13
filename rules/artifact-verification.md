# Artifact Verification Ladder

## Core Principle

**Existence does not equal implementation.** A file being present does not mean it contains real code. Real code does not mean it's connected. Being connected does not mean it works.

## The 4 Verification Levels

### Level 1: Exists
File is present at the expected path.

| Check | Method |
|-------|--------|
| File exists | `[ -f path ]` or Glob |
| Non-empty | File size > 0 |
| Correct location | Path matches specification |

**Status**: EXISTS / MISSING

### Level 2: Substantive
Content is real implementation, not placeholder or stub.

| Check | What to Grep For (Red Flags) |
|-------|------------------------------|
| No TODO/FIXME/TBD markers | `TODO\|FIXME\|XXX\|HACK\|PLACEHOLDER\|TBD` |
| No placeholder text | `placeholder\|lorem ipsum\|coming soon\|your code here` |
| No empty implementations | `return null;\|return {};\|return [];\|pass$` |
| Meaningful line count | File > 10-15 lines for components, > 5 for utilities |
| Has actual logic | Not just `console.log` or `print` statements |
| Has expected patterns | Component renders JSX / API handles requests / Hook uses React hooks |

**Status**: SUBSTANTIVE / STUB

### Level 3: Wired
Connected to the rest of the system — not an orphan.

| Connection Type | What to Verify |
|----------------|---------------|
| Imports resolve | `import X from './Y'` → Y exists and exports X |
| Component imported | Component appears in another file's import |
| API route registered | Route is referenced in router/config |
| Database model used | Model is imported by at least one API/handler |
| Hook called in component | Custom hook is actually invoked in a component |
| State rendered | State variables appear in JSX/template output |

**Key wiring patterns to verify:**
- Component → API: fetch/axios call exists AND response is used
- API → Database: query exists AND result is returned (not `{ok: true}`)
- Form → Handler: onSubmit has real implementation (not just preventDefault)
- State → Render: state variables appear in rendered output (not hardcoded)

**Status**: WIRED / ORPHANED

### Level 4: Functional
Actually works when invoked.

| Check | Method |
|-------|--------|
| Tests pass | `npm test` / `vitest run` / relevant test command |
| No runtime errors | Dev server starts without crashes |
| Endpoints respond | curl/fetch returns expected status code |
| UI renders | Component mounts without errors |

**Status**: FUNCTIONAL / BROKEN (requires human verification for some cases)

## Minimum Verification Level by Task Complexity

| Task Scope | Minimum Level | Rationale |
|-----------|--------------|-----------|
| Single file change | Level 1 (Exists) | Small scope, low risk |
| 2-3 file change | Level 2 (Substantive) | Must verify real content |
| 3+ file change | Level 3 (Wired) | Must verify connections |
| Feature / phase completion | Level 4 (Functional) | Must verify end-to-end |

## Stub Detection Reference

Universal patterns that indicate a file is NOT substantive:

### Comment-Based Stubs
```
TODO|FIXME|XXX|HACK|PLACEHOLDER|STUB|TBD
```

### Placeholder Text
```
placeholder|lorem ipsum|coming soon|your code here|not implemented
```

### Empty Implementations
```
return null;|return {};|return [];|pass$|// ... existing code ...
```

### Hardcoded Where Dynamic Expected
```
Response.json({ message: "Not implemented" })
return [{ id: 1, name: "Example" }]  # hardcoded mock data in production
onClick={() => {}}  # empty handler
```

### React/Next.js Specific
```
<div>Component Name</div>  # wrapper-only component
return null  # renders nothing
```

### API Route Specific
```
Response.json({ message: "Not implemented" })  # stub response
return []  # empty array response
# no error handling
# no input validation
```

## Formal Deferral Exception (from GSD v1.42.0 #3343)

TBD/FIXME/XXX 标记如果携带正式延期引用，不算 stub。格式：

```
TBD(defer:PROJ-123)     — 关联到具体 issue/ticket
FIXME(defer:reason)      — 附带延后原因
XXX(tracked:JIRA-456)   — 已有追踪
```

无延期引用的 TBD/FIXME/XXX → 视为 stub，阻断完成。

## Completion Blocking Rule

Verifier 在标记任务完成前，必须扫描所有产出文件中的 `TBD`、`FIXME`、`XXX` 标记：

- **有正式延期引用** → 记录为 deferred，不阻断
- **无正式延期引用** → 阻断完成，必须解决或补充延期引用
- **此规则优先于** Level 2 的 SUBSTANTIVE 判定：即使文件内容充实，未决标记仍需处理

## Status Combinations

| L1 | L2 | L3 | L4 | Overall Status | Action |
|----|----|----|----|---------------|--------|
| PASS | PASS | PASS | PASS | VERIFIED | None — artifact is complete |
| PASS | PASS | PASS | - | WIRED | Needs functional testing (L4) |
| PASS | PASS | FAIL | - | ORPHANED | Connect to system |
| PASS | FAIL | - | - | STUB | Replace with real implementation |
| FAIL | - | - | - | MISSING | Create the file |

## Integration with Existing Verification

| Existing Rule | Artifact Verification Relationship |
|--------------|----------------------------------|
| goal-verification.md must_haves.artifacts | Uses this 4-level ladder for each artifact check |
| testing.md (80% coverage) | Complementary: testing = code correctness. Artifact verification = implementation completeness |
| verifier.md checklist | This ladder is the HOW for the verifier's "implementation matches specification" check |

## Rules

- **DO NOT** accept Level 1 (Exists) as sufficient for multi-file changes
- **DO NOT** skip Level 3 (Wired) — orphans are the most common hidden failure
- **DO NOT** assume Level 4 (Functional) without tests or human verification
- **DO** check wiring patterns end-to-end (source → destination → response)
- **DO** use the stub detection patterns to catch placeholder implementations
- **DO** flag artifacts that need human verification at Level 4
