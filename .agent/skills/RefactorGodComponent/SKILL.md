---
name: RefactorGodComponent
description: A systematic workflow for breaking down large, complex React components ("God Components") into modular, maintainable code.
---

# RefactorGodComponent Skill

This skill guides the AI agent through the process of refactoring a large React component (300+ lines) into a clean, modular architecture following Next.js and React best practices.

## ⚠️ Critical Rules
1.  **Safety First**: Never change business logic without understanding it. If unsure, ask the user or add comments.
2.  **Incremental Changes**: Do not try to refactor the entire file in one go. Extract one piece at a time (e.g., one modal, one hook).
3.  **No New Libraries**: Do not introduce new external dependencies (like Redux, Zustand) unless explicitly requested. Use standard React state (`useState`, `useReducer`, `Context`).

## Process

### Phase 1: Analysis & Roadmap
Before writing code, analyze the target component:
1.  **Identify State**: List all `useState` and `useReducer` hooks. Group them by feature (e.g., "Scoreboard State", "Modal State").
2.  **Identify Effects**: List `useEffect` hooks and their dependencies. Note any side effects (localStorage, API calls).
3.  **Identify UI Blocks**: Look for large chunks of JSX that represent distinct UI elements (e.g., `<Dialog>...</Dialog>`, or a large mapping of list items).
4.  **Create a Plan**: Propose a list of:
    *   **Custom Hooks** to extract (e.g., `useMatchLogic`, `useScoreboard`).
    *   **Sub-components** to extract (e.g., `ScoreControlPanel`, `PlayerList`).

### Phase 2: Execution (Iterative)

#### Step 2.1: Extract Types
Move all TypeScript interfaces and types to a dedicated `types.ts` file (or `types/` folder) if they are used in multiple places.

#### Step 2.2: Extract Logic to Hooks
Move complex state and handlers into custom hooks.
*   **Goal**: The main component should mostly contain layout and hook calls.
*   **Pattern**:
    ```tsx
    // Before
    const [score, setScore] = useState(0);
    const handleScore = () => setScore(s => s + 1);
    
    // After
    const { score, handleScore } = useScoreboard();
    ```

#### Step 2.3: Extract UI to Sub-components
Move distinct UI blocks to separate files.
*   **Location**: Create a folder named after the main component (e.g., `components/MatchReport/`) and place sub-components there.
*   **Props**: Pass only necessary data. Avoid passing large state objects if possible; prefer primitives or specific interfaces.

### Phase 3: Verification
1.  **Check Props**: Ensure all new sub-components have typed props.
2.  **Check Dependencies**: Ensure `useEffect` dependencies are correct in new hooks.
3.  **Manual Test Plan**: Remind the user to test specific flows that might be affected (e.g., "Test the Undo button since we moved its logic").

## Example Output Structure

```text
src/components/
  MatchParent/
    index.tsx        (Main container, data fetching)
    MatchView.tsx    (Presentational component)
    useMatch.ts      (Business logic hook)
    components/      (Smaller parts)
      ScoreCard.tsx
      Controls.tsx
```
