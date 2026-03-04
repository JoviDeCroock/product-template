---
name: signals
description: Guidelines for state management with createModel, Show, and For using Preact Signals.
---

# Working with Signals

Guidelines for state management with `createModel`, `Show`, and `For` using `@preact/signals` and `@preact/signals/utils`.

## What are Signals and Signal Utils?

Signals are reactive primitives from `@preact/signals` that provide fine-grained reactivity. `@preact/signals/utils` adds ergonomic helpers like `Show` and `For` for declarative rendering, while `createModel` comes from `@preact/signals` for model-driven state.

## Basic Usage

### Creating a Model with `createModel`

```tsx
import { computed, createModel, signal } from '@preact/signals';

export const CounterModel = createModel(() => {
  const count = signal(0);
  const name = signal<string | null>(null);
  const items = signal<Item[]>([]);

  const hasItems = computed(() => items.value.length > 0);

  const increment = () => {
    count.value++;
  };

  const addItem = (item: Item) => {
    items.value = [...items.value, item];
  };

  return {
    count,
    name,
    items,
    hasItems,
    increment,
    addItem,
  };
});
```

### Reading and Writing

```tsx
import { useModel } from '@preact/signals';

const model = useModel(CounterModel);

// Read with .value
<span>{model.count.value}</span>

// Write with .value assignment
<button onClick={model.increment}>Increment</button>
<button onClick={() => (model.name.value = 'Alice')}>Set Name</button>
```

### Declarative Rendering with `Show` and `For`

```tsx
import { useModel } from '@preact/signals';
import { For, Show } from '@preact/signals/utils';

function ItemList() {
  const model = useModel(CounterModel);

  return (
    <>
      <Show when={model.hasItems} fallback={<p>No items yet.</p>}>
        <ul>
          <For each={model.items}>
            {(item) => <li key={item.value.id}>{item.value.label}</li>}
          </For>
        </ul>
      </Show>
    </>
  );
}
```

## When to Use Signals

### Use Signals For:

1. **UI state that changes frequently**
   - Toggle states (open/closed, expanded/collapsed)
   - Form input values
   - Loading/error states
   - Progress indicators

2. **State used in event handlers**
   - Drag/drop coordinates
   - Mouse position tracking
   - Resize dimensions

3. **State derived from async operations**
   - Authentication status
   - API response data
   - Upload progress

### Example Patterns from the Codebase

**Toggle state (FAQ accordion model):**
```tsx
const FAQItemModel = createModel(() => {
  const open = signal(false);
  const toggle = () => {
    open.value = !open.value;
  };

  return { open, toggle };
});

function FAQItem({ question, answer }) {
  const model = useModel(FAQItemModel);

  return (
    <div>
      <button onClick={model.toggle}>
        {question}
      </button>
      <Show when={model.open}>
        <div>{answer}</div>
      </Show>
    </div>
  );
}
```

**Auth state model:**
```tsx
const AuthModel = createModel(() => {
  const isAuthenticated = signal<boolean | null>(null);
  const checkingAuth = signal(true);

  const loadSession = async () => {
    const res = await authClient.getSession();
    isAuthenticated.value = !!res.data?.user;
    checkingAuth.value = false;
  };

  return { isAuthenticated, checkingAuth, loadSession };
});

const auth = useModel(AuthModel);
useEffect(() => {
  auth.loadSession();
}, []);
```

**Upload progress:**
```tsx
const UploadModel = createModel(() => {
  const isDragging = signal(false);
  const isUploading = signal(false);
  const uploadError = signal<string | null>(null);
  const uploadProgress = signal(0);

  return { isDragging, isUploading, uploadError, uploadProgress };
});
```

**Window drag state:**
```tsx
const WindowModel = createModel(() => {
  const isDragging = signal(false);
  const position = signal({ x: 0, y: 0 });
  const size = signal({ width: 800, height: 600 });

  return { isDragging, position, size };
});
```

## Signals in Reusable Models

Encapsulate complex signal logic in models:

```tsx
// models/WindowDragModel.ts
export const WindowDragModel = createModel(({ defaultWidth, defaultHeight }) => {
  const isDragging = signal(false);
  const position = signal({ x: 0, y: 0 });
  const size = signal({ width: defaultWidth, height: defaultHeight });

  // Event handlers that mutate signals...

  return {
    isDragging,
    position,
    size,
    handleMouseDown,
  };
});

// component
const drag = useModel(WindowDragModel);
```

## Signals vs useState

| Use Case | Prefer |
|----------|--------|
| Simple boolean toggle | `signal` in `createModel` |
| Object with multiple fields updated together | `signal` in `createModel` |
| State updated in event handlers | `signal` in `createModel` |
| State passed deep into children | `createModel` + `Show`/`For` |
| State that rarely changes | Either works |
| State managed by external library | Follow library conventions |

## Best Practices

### 1. Type Your Signals

Always provide types for non-obvious signal values:

```tsx
const user = signal<User | null>(null);
const status = signal<'idle' | 'loading' | 'error'>('idle');
```

### 2. Mutate Directly in Handlers

Signals don't need functional updates like useState:

```tsx
// With signals - direct mutation is fine
onClick={() => count.value++}
onClick={() => items.value = [...items.value, newItem]}

// Reading current value in handler
onClick={() => {
  if (count.value < 10) {
    count.value++;
  }
}}
```

### 3. Use `Show` and `For` for Rendering

Prefer `Show` and `For` for common conditional and list rendering:

```tsx
<Show when={isLoading}>
  <Spinner />
</Show>

<Show when={error}>
  <ErrorMessage>{error.value}</ErrorMessage>
</Show>

<For each={items}>
  {(item) => <Item key={item.value.id} {...item.value} />}
</For>
```

> You can also use a callback in the `when` and `each` to simulate a `computed` signal if needed.

### 4. Combine with useEffect

Signals work alongside traditional hooks:

```tsx
useEffect(() => {
  if (isOpen) {
    checkingAuth.value = true;
    fetchData().then(data => {
      result.value = data;
      checkingAuth.value = false;
    });
  }
}, [isOpen]);
```

### 5. Keep Signals Local When Possible

Prefer local signals over global state. Only lift state when multiple components need to share it.

## Common Pitfalls

### Don't Forget `.value`

```tsx
// Wrong - won't update
{isOpen && <Modal />}

// Correct
{isOpen.value && <Modal />}
```

When using `Show`, pass a signal or computed signal to `when`:

```tsx
<Show when={isOpen}>
  <Modal />
</Show>
```

### Object Updates Need New References

```tsx
// Wrong - won't trigger update
position.value.x = 100;

// Correct
position.value = { ...position.value, x: 100 };
// or
position.value = { x: 100, y: position.value.y };
```
