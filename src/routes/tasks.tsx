import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { Badge, PageHeader } from "@/components/PageHeader";
import { useLocalStorage, seed, uid, type Task } from "@/lib/storage";
import { useState } from "react";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Nova" }] }),
  component: TasksPage,
});

function TasksPage() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", seed.tasks);
  const [draft, setDraft] = useState<Omit<Task, "id">>({ title: "", priority: "Medium", due: "", status: "Todo" });
  const [filter, setFilter] = useState<"All" | Task["status"]>("All");

  const add = () => {
    if (!draft.title) return;
    setTasks([{ id: uid(), ...draft }, ...tasks]);
    setDraft({ title: "", priority: "Medium", due: "", status: "Todo" });
  };
  const remove = (id: string) => setTasks(tasks.filter((t) => t.id !== id));
  const cycle = (t: Task) => {
    const order: Task["status"][] = ["Todo", "In Progress", "Done"];
    const next = order[(order.indexOf(t.status) + 1) % order.length];
    setTasks(tasks.map((x) => (x.id === t.id ? { ...x, status: next } : x)));
  };

  const filtered = filter === "All" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <>
      <PageHeader title="Tasks" subtitle="Stay on top of priorities and deadlines." />

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-5 gap-3">
        <input placeholder="What needs to be done?" className="sm:col-span-2 input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <select className="input" value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as Task["priority"] })}>
          <option>Low</option><option>Medium</option><option>High</option>
        </select>
        <input type="date" className="input" value={draft.due} onChange={(e) => setDraft({ ...draft, due: e.target.value })} />
        <button onClick={add} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-sm font-medium text-primary-foreground">
          <Plus className="h-4 w-4" /> Add Task
        </button>
        <style>{`.input{background:rgba(255,255,255,.05);border:1px solid var(--color-glass-border);border-radius:.75rem;padding:.65rem .85rem;font-size:.875rem;outline:none;color:inherit}.input:focus{border-color:var(--primary)}`}</style>
      </motion.div>

      <div className="flex gap-2 mb-4">
        {(["All", "Todo", "In Progress", "Done"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f ? "gradient-primary text-primary-foreground" : "glass-strong text-muted-foreground hover:text-foreground"
            }`}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="glass rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className={`font-medium ${t.status === "Done" ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
              <button onClick={() => remove(t.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/15">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Due {t.due || "—"}</span>
              <Badge tone={t.priority === "High" ? "danger" : t.priority === "Medium" ? "warning" : "info"}>{t.priority}</Badge>
            </div>
            <button onClick={() => cycle(t)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg w-fit transition-colors ${
                t.status === "Done" ? "bg-success/15 text-success"
                  : t.status === "In Progress" ? "bg-primary/20 text-primary-glow"
                  : "bg-white/10 text-foreground"
              }`}>
              {t.status} →
            </button>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="glass rounded-2xl p-10 text-center text-muted-foreground col-span-full">No tasks here.</div>
        )}
      </div>
    </>
  );
}
