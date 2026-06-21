# Session Wrap

Wrap up the current session and improve the harness for future sessions.

## Process

### Step 1: Review Session Work
- Read `.claude/memory/plan.md` and `.claude/memory/todo.md`
- Summarize what was completed vs. what remains
- Note any incomplete items for the next session

### Step 2: Pattern Discovery
Look for opportunities to improve the harness:

| Signal | Action |
|--------|--------|
| Repeated manual work | Suggest a new `/command` to automate it |
| Repeated mistakes | Suggest a new `.claude/rules/` file to prevent them |
| Non-obvious discovery | Record in `.dev/learnings/` for future reference |
| Stale assumption | Suggest removing or updating an existing rule/hook |
| Missing context | Suggest additions to `CLAUDE.md` |

### Step 3: Harness Health Check
- [ ] Is `CLAUDE.md` under 200 lines? (If over, split into rules)
- [ ] Are all `.claude/rules/` files still relevant?
- [ ] Are there unused commands in `.claude/commands/`?
- [ ] Is `.claude/memory/` stale? (Clean up completed plans, archive old plans)
- [ ] Is `settings.local.json` bloated? (Clean up one-time debug allow rules)
- [ ] Any new patterns worth codifying?
- [ ] Run affected test suite: `./test/run-all.sh <module>` to verify session changes didn't break anything

### Step 4: Session Summary
Output a summary for the user:

```
## Session Summary

### Completed
- [list of completed items]

### Remaining
- [list of incomplete items, if any]

### Harness Improvements
- [suggested changes to rules, commands, or CLAUDE.md]

### Next Session Handoff
- [context the next session needs to continue effectively]
```

If multi-session continuity is enabled, also update `.claude/memory/claude-progress.txt`.
