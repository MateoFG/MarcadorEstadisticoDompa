---
name: GenerateComponentTests
description: A workflow to generate comprehensive unit/integration tests for React components using Vitest and React Testing Library.
---

# GenerateComponentTests Skill

This skill guides the AI agent to create robust test suites for React components, ensuring high code coverage and preventing regressions.

## 🛠️ Stack & Tools
*   **Runner**: Vitest
*   **Library**: React Testing Library (`@testing-library/react`)
*   **Matchers**: `@testing-library/jest-dom` (standard DOM assertions)
*   **User Events**: `@testing-library/user-event`

## Process

### Phase 1: Analysis
Before writing tests, analyze the target component:
1.  **Identify Props**: specific constraints, optional vs required.
2.  **Identify User Interactions**: Buttons, Inputs, Toggles.
3.  **Identify States**: Loading, Error, Empty, Success.
4.  **Identify Dependencies**: Does it need a mocked context (e.g., `ThemeProvider`) or mocked hooks (e.g., `useRouter`)?

### Phase 2: Test Scaffolding
Create a file named `[ComponentName].test.tsx` in the same directory (or `__tests__` folder).

**Standard Boilerplate:**
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  // Setup common mocks here
});
```

### Phase 3: Test Cases (The "3-Layer" Approach)

#### Layer 1: Rendering (Smoke Tests)
*   Does it render without crashing?
*   Are key elements visible? (e.g., Title, Submit Button)
*   **Check**: `expect(screen.getByText(/title/i)).toBeInTheDocument()`

#### Layer 2: Interactions (Behavior)
*   **Click**: Does clicking a button call the handler?
    ```tsx
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} />);
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalled();
    });
    ```
*   **Input**: Does typing update the value?

#### Layer 3: Edge Cases & Conditionals
*   **Empty State**: Pass empty arrays/null props.
*   **Loading State**: Verify loading spinners appear.
*   **Error State**: Verify error messages appear.

## ⚠️ Critical Rules
1.  **Accessibility First**: Prefer selecting elements by Role (`getByRole`) or Label (`getByLabelText`) over Test IDs or CSS classes.
2.  **Isolation**: Mock external modules (API calls, complex child components) using `vi.mock()`.
3.  **Async**: Always use `async/await` with `userEvent`.
