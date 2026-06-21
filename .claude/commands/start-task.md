# Start Task

New task entry point. Deep-read the codebase, write a Sprint Contract, get user approval before coding.

## Process

### Step 0: Interview
- Summarize what you understand about the request
- Ask a maximum of 3 clarifying questions
- Confirm scope boundaries (what is IN and OUT of scope)

### Step 1: Deep Codebase Read
- Read full file logic, not just function signatures
- Trace imports and dependencies for all files you plan to modify
- Search for existing similar features or patterns to reuse
- Identify files that will be affected (directly and indirectly)

### Step 2: Sprint Contract
Write to `.claude/memory/plan.md`:
- **Goal**: One sentence describing what will be built
- **Scope**: Files to create/modify (with line-level detail)
- **Completion Criteria**: Measurable, verifiable conditions (not vague "works correctly")
- **Out of Scope**: Explicitly list what will NOT be done
- **Risks**: Potential issues and mitigation strategies

### Step 3: Context Document
Write to `.claude/memory/context.md`:
- Codebase findings relevant to this task
- Design decisions made and why
- Rejected alternatives and reasoning
- File paths and their roles in the change

### Step 4: Checklist
Write to `.claude/memory/todo.md`:
- Step-by-step implementation checklist
- Each item is small enough to complete in one focused pass
- Include verification steps between implementation steps

### Step 5: Wait for Approval
Present the Sprint Contract to the user.
**NO CODING BEFORE USER APPROVAL.**

### Step 6: Execute
After approval:
- Follow the checklist in order
- Git commit per logical unit of work
- Run verification after each unit
- Update todo.md as items are completed
