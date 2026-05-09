import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { Badge, PageHeader } from "@/components/PageHeader";
import { useLocalStorage, seed, uid, type Revision } from "@/lib/storage";
import { useState } from "react";

export const Route = createFileRoute("/revisions")({
  head: () => ({ meta: [{ title: "Revisions — Nova" }] }),
  component: RevisionsPage,
});

function RevisionsPage() {
  const [revs, setRevs] = useLocalStorage<Revision[]>("revisions", seed.revisions);
  const [draft, setDraft] = useState<Omit<Revision, "id">>({ client: "", project: "", notes: "", status: "Pending", date: "" });

  const add = () => {
    if (!draft.client || !draft.notes) return;
    setRevs([{ id: uid(), ...draft }, ...revs]);
    setDraft({ client: "", project: "", notes: "", status: "Pending", date: "" });
  };
  const remove = (id: string) => setRevs(revs.filter((r) => r.id !== id));
  const setStatus = (id: string, status: Revision["status"]) =>
    setRevs(revs.map((r) => (r.id === id ? { ...r, status } : r)));

  const tone = (s: Revision["status"]) => s === "Approved" ? "success" : s === "In Review" ? "info" : "warning";

  return (
    <>
      <PageHeader title="Revisions" subtitle="Track client feedback and revision rounds." />

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-6 gap-3">
        <input placeholder="Client" className="input" value={draft.client} onChange={(e) => setDraft({ ...draft, client: e.target.value })} />
        <input placeholder="Project" className="input" value={draft.project} onChange={(e) => setDraft({ ...draft, project: e.target.value })} />
        <input placeholder="Notes" className="sm:col-span-2 input" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
        <input type="date" className="input" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
        <button onClick={add} className="px-4 py-2.5 rounded-xl gradient-primary text-sm font-medium text-primary-foreground inline-flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" /> Add
        </button>
        <style>{`.input{background:rgba(255,255,255,.05);border:1px solid var(--color-glass-border);border-radius:.75rem;padding:.65rem .85rem;font-size:.875rem;outline:none;color:inherit}.input:focus{border-color:var(--primary)}`}</style>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {revs.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{r.client}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{r.project} · {r.date}</div>
              </div>
              <Badge tone={tone(r.status)}>{r.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-3">{r.notes}</p>
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                {(["Pending", "In Review", "Approved"] as const).map((s) => (
                  <button key={s} onClick={() => setStatus(r.id, s)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                      r.status === s ? "gradient-primary text-primary-foreground" : "glass-strong text-muted-foreground hover:text-foreground"
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
              <button onClick={() => remove(r.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/15">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
        {revs.length === 0 && <div className="glass rounded-2xl p-10 text-center text-muted-foreground col-span-full">No revisions yet.</div>}
      </div>
    </>
  );
}
