import { signal, computed, action, createModel } from "@preact/signals";

interface Note {
  id: string;
  text: string;
  createdAt: Date;
}

export const NotesModel = createModel(() => {
  const items = signal<Note[]>([]);
  const draft = signal("");
  const count = computed(() => items.value.length);

  const add = action(() => {
    const text = draft.value.trim();
    if (!text) return;
    items.value = [{ id: crypto.randomUUID(), text, createdAt: new Date() }, ...items.value];
    draft.value = "";
  });

  const remove = action((id: string) => {
    items.value = items.value.filter((n) => n.id !== id);
  });

  return { items, draft, count, add, remove };
});
