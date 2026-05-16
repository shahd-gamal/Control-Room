import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Trash2, Search } from "lucide-react";
import { Badge, PageHeader, inputClass } from "@/components/PageHeader";
import { useTasks, type Task } from "@/lib/db";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Control Room" }] }),
  component: TasksPage,
});

const PRIORITIES = ["Low", "Medium", "High"];

function TasksPage() {
  const { items, create, update, remove, list } = useTasks();
  const [editing, setEditing] = useState<Task | null>(null);
  const [draft, setDraft] = useState({ title: "", priority: "Medium", due_date: "" });
  const [filter, setFilter] = useState<"All" | "Open" | "Done">("Open");
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      items.filter(
        (t) =>
          (filter === "All" || (filter === "Done" ? t.completed : !t.completed)) &&
          (q === "" || t.title.toLowerCase().includes(q.toLowerCase()))
      ),
    [items, filter, q]
  );

  const submit = async () => {
    if (!draft.title.trim()) return toast.error("Title is required.");
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, patch: { title: draft.title.trim(), priority: draft.priority, due_date: draft.due_date || null } });
        toast.success("Task updated");
      } else {
        await create.mutateAsync({ title: draft.title.trim(), priority: draft.priority, due_date: draft.due_date || null });
        toast.success("Task added");
      }
      setEditing(null);
      setDraft({ title: "", priority: "Medium", due_date: "" });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const toggleDone = (t: Task) =>
    update.mutate({ id: t.id, patch: { completed: !t.completed, status: !t.completed ? "Done" : "Todo" } });

  const startEdit = (t: Task) => {
    setEditing(t);
    setDraft({ title: t.title, priority: t.priority, due_date: t.due_date ?? "" });
  };

  return (
    <>
      <PageHeader title="Tasks" subtitle="Daily to-dos with priorities and due dates." />

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-5 gap-3">
        <input placeholder="What needs to be done?" className={`sm:col-span-2 ${inputClass}`} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <select className={inputClass} value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })}>
          {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>
        <input type="date" className={inputClass} value={draft.due_date} onChange={(e) => setDraft({ ...draft, due_date: e.target.value })} />
        <button onClick={submit} disabled={create.isPending || update.isPending} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-sm font-medium text-primary-foreground disabled:opacity-60">
          <Plus className="h-4 w-4" /> {editing ? "Update" : "Add"}
        </button>
      </motion.div>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        {(["All","Open","Done"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${filter===f?"gradient-primary text-primary-foreground":"glass-strong text-muted-foreground hover:text-foreground"}`}>{f}</button>
        ))}
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Search tasks…" value={q} onChange={(e)=>setQ(e.target.value)} className={`${inputClass} pl-9`} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {list.isLoading && <div className="glass rounded-2xl p-10 text-center text-muted-foreground col-span-full">Loading…</div>}
        {!list.isLoading && filtered.length === 0 && <div className="glass rounded-2xl p-10 text-center text-muted-foreground col-span-full">No tasks.</div>}
        {filtered.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <label className="flex items-start gap-3 cursor-pointer flex-1 min-w-0">
                <input type="checkbox" checked={t.completed} onChange={() => toggleDone(t)} className="mt-1 h-4 w-4 accent-primary" />
                <span className={`font-medium ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
              </label>
              <div className="flex gap-1">
                <button onClick={() => startEdit(t)} className="text-xs text-muted-foreground hover:text-foreground px-2">Edit</button>
                <button onClick={() => remove.mutate(t.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/15">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Due {t.due_date ?? "—"}</span>
              <Badge tone={t.priority === "High" ? "danger" : t.priority === "Medium" ? "warning" : "info"}>{t.priority}</Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
