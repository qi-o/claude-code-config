# Goal-Backward Verification

## Core Principle

**Task completion does not equal goal achievement.** Code written does not mean the problem is solved. This rule implements structured goal verification via `must_haves` — verifiable criteria defined before execution begins.

## Must-Haves Structure

Every plan with **3+ steps** MUST define must_haves in three categories:

```yaml
must_haves:
  truths:
    - "Invariants that must hold when the task is complete"
    - "Each truth is a testable statement about the system state"
  artifacts:
    - path: "src/path/to/file.ts"
      contains: "What the file must contain (not just exist)"
      min_lines: 20  # optional: minimum substantive content
  key_links:
    - from: "src/components/Form.tsx"
      to: "src/api/submit.ts"
      type: "Component -> API: fetch call exists and uses response"
```

## Verification Protocol

Before marking ANY task as complete, execute in this order:

### Step 1: Verify Truths
For each truth in must_haves:
- Run a concrete check (command, grep, test, or inspection)
- Record: `[PASS/FAIL] Truth: [statement] -- Evidence: [what you checked]`
- If FAILED: task is NOT complete

### Step 2: Verify Artifacts (4-Level Check)
For each artifact in must_haves, apply the 4-level ladder from `artifact-verification.md`:
- Level 1 (Exists): File present at expected path?
- Level 2 (Substantive): Real implementation, not placeholder?
- Level 3 (Wired): Connected to the rest of the system?
- Level 4 (Functional): Actually works when invoked?
- Record: `[PASS/FAIL] Artifact: [path] -- Level: [1-4] -- Evidence: [...]`
- Minimum required level: per `artifact-verification.md` complexity rules

### Step 3: Verify Key Links
For each key_link in must_haves:
- Trace the connection end-to-end
- Verify source actually calls/imports/references target
- Verify target actually receives and processes the input
- Record: `[PASS/FAIL] Key Link: [from] -> [to] -- Evidence: [...]`

### Step 4: Gate Decision
```
IF any truth FAILED → task NOT complete
IF any artifact below minimum level → task NOT complete
IF any key_link not wired → task NOT complete
IF any must_have is UNKNOWN (not yet verified due to context limits) → save state, flag remaining items, delegate to fresh agent or escalate to user
IF must_haves from different sources contradict → escalate to user, do NOT resolve autonomously
ELSE → task complete
```

### Phase/Milestone Gate (from GSD v1.36)

When completing a phase or milestone (not just a single task):

**Pre-close Audit** — before marking any phase complete, run:
1. List all artifacts the phase was supposed to produce
2. For each artifact, verify minimum Level 3 (Wired) per artifact-verification.md
3. Auto-detect build system and run build + test (from GSD v1.39):
   - Detect: `package.json` → `npm run build && npm test`, `Cargo.toml` → `cargo build && cargo test`, `Makefile` → `make && make test`, `justfile` → `just build && just test`, `*.xcodeproj` → `xcodebuild build/test`, `go.mod` → `go build ./... && go test ./...`, `pyproject.toml` / `setup.py` → `pytest`
   - Gate: zero build errors AND zero test failures required to proceed
   - If no build system detected → skip this step (not all projects have automated builds)
4. Trace all key_links end-to-end (source → destination → response)
5. Confirm no pending must_haves from the phase's plan

**Gate Decision**:
- ALL artifacts at Level 3+ AND all key_links wired AND build/test gate passed → PASS, phase may close
- ANY artifact below Level 3 OR any key_link broken OR build/test failures → FAIL, phase NOT complete
- UNKNOWN artifacts (cannot verify) → delegate to verifier agent before closing

This gate is MANDATORY for:
- `ultrawork` session completion
- `ralph` wave completion
- Any `plan` skill's final step
- Multi-phase project milestones

## Priority Hierarchy

When multiple sources define verification criteria, the most specific wins:

1. **must_haves from the plan** (plan-specific detail) — highest priority
2. **Acceptance criteria from the specification** (feature-level)
3. **Derived from the task description** (fallback — "what would make this task done?")

must_haves MUST NOT reduce scope vs. higher-priority sources. If the plan's must_haves are weaker than the spec's acceptance criteria, use the spec's criteria.

## Integration with Existing Verification

This rule **extends** the verifier agent's checklist (in `verifier.md`) and the independent-review.md framework:

| Existing Layer | What It Checks | How Must-Haves Fit |
|---------------|---------------|-------------------|
| independent-review.md Layer 1 | Root cause analysis | must_haves truth verification at symptom check |
| independent-review.md Layer 2 | Plan validation | must_haves coverage in plan review |
| verifier.md checklist | Acceptance criteria | must_haves add structured evidence requirements |
| testing.md | 80% coverage | must_haves complement test coverage with functional checks |

## Applicability

| Task Complexity | Must-Haves Required? |
|----------------|---------------------|
| Single file change | No — existing verification sufficient |
| 2-3 file change | Optional — define at least truths |
| 3+ file change / multi-step plan | **Mandatory** — all three categories |
| Feature / phase completion | **Mandatory** — all three categories |

## Rules

- **DO NOT** mark a task complete if any must_have is FAILED
- **DO NOT** weaken must_haves to make them pass — fix the implementation
- **DO NOT** skip verification steps because "it looks right"
- **DO** record evidence for every PASS and FAIL
- **DO** escalate when a must_have cannot be verified programmatically (flag for human review)
- **DO** use `verifier` agent for independent must_haves verification (producer ≠ reviewer)
