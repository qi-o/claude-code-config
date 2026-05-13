# Deviation Handling

## Core Principle

Plans describe intent. Reality diverges. This rule defines exactly what to do when reality doesn't match the plan — which fixes to make autonomously, and when to stop and ask.

## The 4 Deviation Rules

When implementation diverges from plan during execution, apply rules in priority order:

| Priority | Type | Action | User Permission |
|----------|------|--------|----------------|
| 1 | **Bug found** | Auto-fix → verify fix → log deviation → continue | Not required |
| 2 | **Missing from plan** | Auto-add → document why it matters → continue | Not required |
| 3 | **Blocking dependency** | Auto-resolve if straightforward → log resolution → continue | Not required |
| 4 | **Architectural change** | STOP immediately → present options to user → wait | **Required** |

### Rule 1: Bug Found
- **Trigger**: Broken behavior, runtime error, test failure
- **Scope**: Only bugs directly caused by current task implementation
- **Action**: Fix inline, run tests to verify, log the deviation
- **Limit**: 3 auto-fix attempts per task, then STOP and escalate per independent-review.md's 3x retry rule (reassess architecture, consider escalation, evaluate alternative approaches). Do NOT silently move on.
- **Pre-existing bugs**: Log to deferred items, do NOT fix (out of scope)

### Rule 2: Missing from Plan
- **Trigger**: Required error handling missing, no input validation, missing auth check, edge case not covered
- **Action**: Add the missing piece, document why it was needed
- **Boundary**: Only auto-add if the missing piece was explicitly mentioned in the spec/user request but omitted from the plan. If the missing piece is an agent-inferred requirement, it requires user confirmation before adding.
- **NOT for**: Nice-to-haves, speculative features, future requirements (YAGNI per anti-patterns.md), agent-inferred "improvements"

### Rule 3: Blocking Dependency
- **Trigger**: Missing npm package, absent directory structure, wrong import path, type mismatch from upstream
- **Action**: Resolve if straightforward (install package, create directory, fix import)
- **Scope**: Only dependencies that directly block the current task
- **NOT for**: Major version upgrades, library replacements, build system changes (these are Rule 4)

### Rule 4: Architectural Change Required
- **Trigger**: Need new database table, switching libraries, changing auth system, modifying shared interfaces
- **Action**: STOP execution immediately. Present to user:
  - What was planned
  - What was discovered
  - Why the plan needs changing
  - 2-3 options with trade-offs
- **NEVER** make architectural decisions autonomously

## 3+ Deviations Rule

If **3 or more deviations** of any type occur within a single task:

1. **STOP execution**
2. **Summarize all deviations** to the user
3. **Assess**: Is the plan fundamentally wrong, or just encountering friction?
4. **Ask user**: Continue with adjustments, or re-plan?

This prevents "death by a thousand cuts" — many small deviations can compound into a completely different implementation than what was planned.

## Deviation Log Format

Every deviation must be recorded:

```markdown
## Deviation: [brief title]
**Type:** bug | missing | blocking | architectural
**Discovery:** What was found during implementation
**Action:** What was done about it
**Impact:** Files changed, scope affected, time cost
```

## Integration with Existing Rules

| Existing Rule | Deviation Handling Relationship |
|--------------|-------------------------------|
| independent-review.md "3x retry" | Complementary: 3x retry = fix fails → reassess. 3+ deviations = too many changes → reassess |
| anti-patterns.md | Orthogonal: anti-patterns = code quality rules. Deviations = plan-reality divergence rules |
| context-budget.md | Complementary: context pressure causes passive behavior → deviations increase. Both rules address different failure modes |
| executor.md "Anti-Patterns Forbidden" | Orthogonal: code anti-patterns vs plan deviation handling |

## Skipped Steps (plan says X but X is already done)

If a planned step is discovered to be already complete or unnecessary:
- Skip the step and log the reason
- This is NOT a deviation — it is efficient execution
- Do NOT re-implement something that already works

## Scope Boundary

Deviation handling applies **only during active implementation**:

- **Applies to**: executor agent, debugger agent during fix implementation
- **Does NOT apply to**: planner agent (planning phase), reviewer agent (review phase), research agents

## Safe-Resume: Drift Detection (from GSD v1.42.0 #3329)

When execution is interrupted and later resumed (context compaction, session restart, agent handoff):

1. **Detect drift before continuing**: Compare current codebase state against the plan. Check:
   - Files the plan expected to be modified — are they still in the expected state?
   - Branch — still on the correct branch?
   - Dependencies — still installed and compatible?
2. **If drift detected**: Log as a deviation, reassess whether the plan is still valid
3. **If no drift**: Resume from the last completed step
4. **Never assume** that state is unchanged after an interruption — always verify

This prevents duplicate executor dispatch and conflicting changes when resuming interrupted work.

## Analysis Paralysis Guard

If you make **5+ consecutive Read/Grep/Glob calls** without any Edit/Write/Bash action:

1. **STOP** — state in one sentence why you haven't written anything yet
2. If you don't know why → delegate to a fresh subagent with the full context
3. If you're uncertain about approach → this is a Rule 4 deviation (ask user)

## Orchestrator Wait Rule (from GSD v1.39)

After spawning any Task/Agent, the orchestrator MUST wait for the result before continuing. Fire-and-forget spawns are forbidden unless explicitly declared as background tasks (via `run_in_background` or equivalent). Every spawn site must have a clear result-consumption point.

## Rules

- **DO NOT** silently deviate from the plan without logging
- **DO NOT** fix pre-existing bugs (out of scope) — log them as deferred
- **DO NOT** make architectural decisions autonomously — always STOP for Rule 4
- **DO NOT** exceed 3 auto-fix attempts per bug — document and move on
- **DO NOT** spawn subagents without awaiting their results (unless background)
- **DO** log every deviation, even successful auto-fixes
- **DO** escalate to user when 3+ deviations accumulate
- **DO** distinguish between "plan needs adjustment" (Rules 1-3) and "plan is wrong" (Rule 4)
