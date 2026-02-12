---
name: ModularizeLogic
description: A systematic workflow to refactor complex hooks and logic files into modular, testable units.
---

# ModularizeLogic

This skill defines a **standard operating procedure** for identifying, extracting, and modularizing complex logic from large "God Hooks" or overly complex files. Use this when a file (especially a React hook or component) becomes difficult to maintain due to mixed responsibilities (state, effects, calculations).

## Workflow Overview

1.  **Analyze Responsibilities**: Identify distinct domains of logic within the target file.
2.  **Plan Refactor**: Propose a modular structure (pure functions vs. custom hooks).
3.  **Extract Pure Logic**: Move stateless calculations to utility files.
4.  **Extract Specific Hooks**: Move isolated state/effect groups to dedicated custom hooks.
5.  **Recompose**: Update the original file to use the new modules.
6.  **Verify**: Ensure zero regression through testing.

---

## Step 1: Analyze Responsibilities

Before writing code, analyze the target file to identify mixed concerns. Look for:

*   **Pure Calculations**: Math formulas, data transformations, or logic that depends *only* on inputs (no state).
*   **Isolated State**: State variables that only interact with each other (e.g., dialog open/close, form fields).
*   **Side Effects**: `useEffect` blocks that handle specific tasks (e.g., localStorage, document title).
*   **Core Business Logic**: The main orchestration logic that should remain in the primary hook.

**Output**: A list of candidate functions/hooks to extract.

## Step 2: Plan Refactor

Propose the new file structure. Common patterns:

*   `src/lib/calculations.ts` (or specific domain file): For pure math/logic.
*   `src/hooks/use-feature-name.ts`: For specific state/effects (e.g., `useDialog`, `usePersistence`).
*   `src/types.ts`: Centralize types if they are scattered.

**User Confirmation**: Present the plan to the user before executing.

## Step 3: Extract Pure Logic (The "Brain" Surgery)

Move pure functions first. This is the safest and highest-value step.

1.  Create/Update a utility file (e.g., `src/lib/calculations.ts`).
2.  Copy logic from the main file.
3.  Refactor into exported, pure functions (no `use...` hooks inside).
4.  **Verify**: Ensure types are correct.

**Example**:
*   *Before*: Inline math in `useMatchState`.
*   *After*: `calculateSetReport(...)` in `lib/calculations.ts`.

## Step 4: Extract Specific Hooks (The "Limb" Surgery)

Move isolated React logic (state + effects).

1.  Create a new hook file (e.g., `src/hooks/use-dialog.ts`).
2.  Extract `useState`, `useEffect`, and handlers related to that specific feature.
3.  Return only the necessary interface (methods/state) needed by the parent.

**Example**:
*   *Before*: Dialog state and open/close handlers mixed in main hook.
*   *After*: `const { openDialog, ... } = useDialog();`

## Step 5: Recompose Main Hook

Update the original file to use the new utilities and hooks.

1.  Import the new functions and hooks.
2.  Replace the old inline code with calls to the new modules.
3.  Pass necessary data *down* to the new hooks or functions.
4.  **Clean Up**: Remove unused imports and dead code.

## Step 6: Verify (Zero Regression)

Crucial step to ensure the refactor didn't break anything.

1.  **Type Check**: Run `tsc` or check IDE for errors.
2.  **Lint Check**: Ensure no unused variables or hook dependency warnings.
3.  **Runtime Check**:
    *   If tests exist: Run `npm test`.
    *   If no tests: Use a **Browser Subagent** to navigate the app and perform the actions governed by the refactored logic (e.g., "Start a match, add points, check score").

## Checklist for Success

- [ ] Does the new utility file have *zero* React dependencies?
- [ ] Are the new hooks focused on a *single* responsibility?
- [ ] Is the original file significantly smaller and easier to read?
- [ ] Did the app pass verification?
