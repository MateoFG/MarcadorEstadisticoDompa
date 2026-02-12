---
description: A workflow to detect and fix unsafe access to browser-specific APIs (localStorage, window, document) in Next.js Server Side Rendering (SSR) environments.
---

# SSR Safe Browser APIs

Next.js applications render components on the server (Node.js) where browser-specific APIs like `window`, `document`, and `localStorage` are not available. Accessing these directly during the initial render or in the component body will cause 500 errors or hydration mismatches.

This skill provides a systematic approach to identifying and fixing these issues.

## 1. Detection

Look for the following patterns in your code, especially in:
- `useMatchState` hooks or any custom hooks.
- Logic outside of `useEffect` or `componentDidMount`.
- Initialization of `useState`.
- Third-party library configurations (e.g., i18next).

### Unsafe Patterns ❌
```typescript
// Direct access in component body
const width = window.innerWidth; 

// Direct access in useState initializer without check
const [value, setValue] = useState(localStorage.getItem('key')); 

// Object usage
if (localStorage.getItem('foo')) { ... }
```

## 2. The Fix Pattern

Wrap any browser API access in a robust check.

### Robust Check ✅
```typescript
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
    // Safe to use localStorage
    localStorage.getItem('key');
}
```

### Safe Usage Strategies

#### Strategy A: `useEffect` (Recommended)
Move all browser API logic inside `useEffect`, which only runs on the client.

```typescript
useEffect(() => {
    // This code only runs in the browser
    if (localStorage.getItem('theme') === 'dark') {
        setTheme('dark');
    }
}, []);
```

#### Strategy B: Lazy Initialization with Checks
If you need it for initial state, provide a fallback.

```typescript
const [val, setVal] = useState(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
        return localStorage.getItem('key') || 'default';
    }
    return 'default'; // SSR fallback
});
```

#### Strategy C: Conditional Component Rendering
For components that rely entirely on browser APIs (like `Scoreboard` using `window.innerWidth`), render them only after mount.

```typescript
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
    setIsMounted(true);
}, []);

if (!isMounted) return null; // or a skeleton

return <BrowserOnlyComponent />;
```

## 3. Verification

After applying fixes:
1. Stop the dev server (`Ctrl+C`).
2. Delete `.next` folder to clear cache (`rm -rf .next`).
3. Run `npm run dev`.
4. Hard refresh the browser (`Cmd+Shift+R`).
5. Verify no server-side console errors (500).
