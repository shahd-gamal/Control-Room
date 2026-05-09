import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, DollarSign, Plus, Trash2, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { useLocalStorage, seed, uid, type Tx } from "@/lib/storage";
import { useState } from "react";

export const Route = createFileRoute("/finance")({
  head: () => ({ meta: [{ title: "Finance — Nova" }] }),
  component: FinancePage,
});

function FinancePage() {
  const [tx, setTx] = useLocalStorage<Tx[]>("tx", seed.tx);
  const [draft, setDraft] = useState<Omit<Tx, "id">>({ label: "", amount: 0, type: "income", date: "" });

  const income = tx.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const expenses = tx.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0);
  const profit = income - expenses;

  const add = () => {
    if (!draft.label || !draft.amount) return;
    setTx([{ id: uid(), ...draft }, ...tx]);
    setDraft({ label: "", amount: 0, type: "income", date: "" });
  };
  const remove = (id: string) => setTx(tx.filter((t) => t.id !== id));

  return (
    <>
      <PageHeader title="Finance" subtitle="Track income, expenses and profit at a glance." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Income" value={`$${income.toLocaleString()}`} icon={ArrowUpRight} delta="This month" index={0} />
        <StatCard label="Expenses" value={`$${expenses.toLocaleString()}`} icon={ArrowDownRight} delta="This month" positive={false} index={1} />
        <StatCard label="Net Profit" value={`$${profit.toLocaleString()}`} icon={TrendingUp} delta={profit >= 0 ? "Healthy" : "Negative"} positive={profit >= 0} index={2} />
      </div>

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 my-6 grid grid-cols-1 sm:grid-cols-5 gap-3">
        <input placeholder="Label" className="sm:col-span-2 input" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
        <input type="number" placeholder="Amount" className="input" value={draft.amount || ""} onChange={(e) => setDraft({ ...draft, amount: +e.target.value })} />
        <select className="input" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as Tx["type"] })}>
          <option value="income">Income</option><option value="expense">Expense</option>
        </select>
        <div className="flex gap-2">
          <input type="date" className="input flex-1" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
          <button onClick={add} className="px-4 rounded-xl gradient-primary text-sm font-medium text-primary-foreground inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <style>{`.input{background:rgba(255,255,255,.05);border:1px solid var(--color-glass-border);border-radius:.75rem;padding:.65rem .85rem;font-size:.875rem;outline:none;color:inherit}.input:focus{border-color:var(--primary)}`}</style>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground bg-white/5">
              <tr>
                {["Label", "Type", "Amount", "Date", ""].map((h) => (
                  <th key={h} className="text-left font-medium px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tx.map((t) => (
                <tr key={t.id} className="border-t border-glass-border hover:bg-white/[0.03]">
                  <td className="px-5 py-4 font-medium">{t.label}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                      <DollarSign className="h-3 w-3" />{t.type}
                    </span>
                  </td>
                  <td className={`px-5 py-4 font-semibold ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                    {t.type === "income" ? "+" : "−"}${t.amount.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{t.date}</td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => remove(t.id)} className="p-2 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive">
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
