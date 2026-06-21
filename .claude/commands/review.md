# Review

Self-review before claiming work is done.

> Key mindset: Review as a skeptical external reviewer.
> Suppress the urge to praise your own work. Find problems.

## Process

### Step 1: Inventory Changes
- Run `git diff --name-only` to list all modified files
- Summarize what changed and why for each file

### Step 2: Code Quality Check
For each modified file, verify:
- [ ] Error handling: Are all error paths handled? No swallowed exceptions?
- [ ] Auth: Are new endpoints protected? Are permissions checked?
- [ ] SQL safety: Parameterized queries only? No injection vectors?
- [ ] Secret exposure: No credentials in code, logs, or comments?
- [ ] Update markers: Java changes wrapped in `update-begin`/`update-end` comments?

### Step 3: Verification Loop
- [ ] Build passes (`mvn clean package -DskipTests` for backend, `pnpm build` for frontend)
- [ ] Trace I/O flow: follow data from input to output
- [ ] Cross-file impact: check all callers of modified functions
- [ ] Run related test suite — all green?

### Step 4: Sprint Contract Verification
- Open `.claude/memory/plan.md`
- Run each completion criterion explicitly
- **"Almost done" is NOT done.** Every criterion must PASS or be marked FAIL with explanation.

### Step 5: Edge Cases
Test or reason through:
- Empty / null / undefined inputs
- Unauthorized access attempts
- Network failure / timeout scenarios
- Concurrent modification
- Maximum / minimum boundary values

### Step 6: Verdict
- All checks PASS → "Self-review passed. Ready for user review."
- Any check FAIL → Fix the issue, then re-run this review from Step 1.
