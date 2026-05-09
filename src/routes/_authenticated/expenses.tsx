import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Trash2, Search, ArrowDownRight } from "lucide-react";
import { PageHeader, inputClass } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { useExpenses, type Expense } from "@/lib/db";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/expenses")({
  head: () => ({ meta: [{ title: "Expenses — Nova" }] }),
  component: ExpensesPage,
});

const CATS = ["ads", "tools", "internet", "subscriptions", "other"];
const today = () => new Date().toISOString().slice(0, 10);

function ExpensesPage() {
  const { items, create, update, remove, list } = useExpenses();
  const [editing, setEditing] = useState<Expense | null>(null);
  const [draft, setDraft] = useState({ category: "ads", amount: "", date: today(), notes: "" });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const total = items.reduce((a, b) => a + Number(b.amount), 0);

  const filtered = useMemo(
    () =>
      items.filter(
        (e) =>
          (cat === "All" || e.category === cat) &&
          (q === "" || (e.notes ?? "").toLowerCase().includes(q.toLowerCase()) || e.category.toLowerCase().includes(q.toLowerCase()))
      ),
    [items, q, cat]
  );

  const submit = async () => {
    const amount = Number(draft.amount);
    if (!amount || amount <= 0) return toast.error("Enter a positive amount.");
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, patch: { category: draft.category, amount, date: draft.date, notes: draft.notes || null } });
        toast.success("Expense updated");
      } else {
        await create.mutateAsync({ category: draft.category, amount, date: draft.date, notes: draft.notes || null });
        toast.success("Expense added");
      }
      setEditing(null);
      setDraft({ category: "ads", amount: "", date: today(), notes: "" });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const startEdit = (e: Expense) => {
    setEditing(e);
    setDraft({ category: e.category, amount: String(e.amount), date: e.date, notes: e.notes ?? "" });
  };

  return (
    <>
      <PageHeader title="Expenses" subtitle="Track every business cost." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total" value={`$${total.toLocaleString()}`} icon={ArrowDownRight} delta={`${items.length} entries`} positive={false} index={0} />
        <StatCard label="This Month" value={`$${items.filter(i => i.date.startsWith(today().slice(0,7))).reduce((a,b)=>a+Number(b.amount),0).toLocaleString()}`} icon={ArrowDownRight} delta={today().slice(0,7)} positive={false} index={1} />
        <StatCard label="Categories" value={String(new Set(items.map(i=>i.category)).size)} icon={ArrowDownRight} delta="active" index={2} />
      </div>

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-6 gap-3">
        <select className={inputClass} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
          {CATS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input type="number" step="0.01" placeholder="Amount" className={inputClass} value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value })} />
        <input type="date" className={inputClass} value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
        <input placeholder="Notes" className={`sm:col-span-2 ${inputClass}`} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
        <button onClick={submit} disabled={create.isPending || update.isPending} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-sm font-medium text-primary-foreground disabled:opacity-60">
          <Plus className="h-4 w-4" /> {editing ? "Update" : "Add"}
        </button>
      </motion.div>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Search…" value={q} onChange={(e)=>setQ(e.target.value)} className={`${inputClass} pl-9`} />
        </div>
        <select className={inputClass} value={cat} onChange={(e) => setCat(e.target.value)}>
          <option>All</option>{CATS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground bg-white/5">
              <tr>{["Category","Amount","Date","Notes",""].map((h) => <th key={h} className="text-left font-medium px-5 py-3.5">{h}</th>)}</tr>
            </thead>
            <tbody>
              {list.isLoading && <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">Loading…</td></tr>}
              {!list.isLoading && filtered.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">No expenses.</td></tr>}
              {filtered.map((e) => (
                <tr key={e.id} className="border-t border-glass-border hover:bg-white/[0.03]">
                  <td className="px-5 py-4 font-medium capitalize">{e.category}</td>
                  <td className="px-5 py-4 text-destructive font-semibold">−${Number(e.amount).toLocaleString()}</td>
                  <td className="px-5 py-4 text-muted-foreground">{e.date}</td>
                  <td className="px-5 py-4 text-muted-foreground truncate max-w-[260px]">{e.notes ?? "—"}</td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button onClick={() => startEdit(e)} className="text-xs text-muted-foreground hover:text-foreground mr-3">Edit</button>
                    <button onClick={() => remove.mutate(e.id)} className="p-2 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </>
  );
}
