#!/bin/bash
# PUA v2 SessionStart hook: restore runtime state from builder-journal.md
# Only injects state if the file exists and was written within the last 2 hours

JOURNAL="$HOME/.puav2/builder-journal.md"

if [ ! -f "$JOURNAL" ]; then
  exit 0
fi

# Check if file was modified within last 2 hours (7200 seconds)
if [ "$(uname)" = "Darwin" ]; then
  age=$(( $(date +%s) - $(stat -f %m "$JOURNAL") ))
else
  age=$(( $(date +%s) - $(stat -c %Y "$JOURNAL") ))
fi

if [ "$age" -gt 7200 ]; then
  exit 0
fi

# File exists and is fresh — output calibration prompt
cat <<'PROMPT'
[PUA v2 Calibration — State Recovery]

A previous context compaction saved PUA runtime state to ~/.puav2/builder-journal.md.
You MUST immediately read this file and restore your PUA v2 runtime state:

1. Read ~/.puav2/builder-journal.md
2. Restore: pressure_level, failure_count, current_flavor, tried_approaches, active task context
3. Output a calibration banner:

---
**[Calibration] PUA v2 State Recovered**

| | |
|---|---|
| Pressure Level | L{N} |
| Failure Count | {N} |
| Flavor | {flavor} |
| Task | {task description} |

> **Compaction detected. State recovered from builder-journal.md. Resuming from breakpoint — standards don't reset just because context got compressed. The pressure stays.**
---

4. Continue the task from where you left off, at the SAME pressure level
5. Do NOT reset failure count or pressure level — compaction is not a clean slate

PROMPT
