import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Trash2, Search } from "lucide-react";
import { Badge, PageHeader, inputClass } from "@/components/PageHeader";
import { useClients, type Client } from "@/lib/db";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/clients")({
  head: () => ({ meta: [{ title: "Clients — Control Room" }] }),
  component: ClientsPage,
});

const STATUSES = ["pending", "paid"];

function ClientsPage() {
  const { items, create, update, remove, list } = useClients();
  const [editing, setEditing] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ name: "", phone: "", service_type: "", total_price: "", paid_amount: "", status: "pending", notes: "" });
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = useMemo(
    () =>
      items.filter(
        (c) =>
          (statusFilter === "All" || c.status === statusFilter) &&
          (q === "" ||
            c.name.toLowerCase().includes(q.toLowerCase()) ||
            (c.phone ?? "").includes(q) ||
            (c.service_type ?? "").toLowerCase().includes(q.toLowerCase()))
      ),
    [items, q, statusFilter]
  );

  const reset = () => {
    setEditing(null);
    setDraft({ name: "", phone: "", service_type: "", total_price: "", paid_amount: "", status: "pending", notes: "" });
    setShowForm(false);
  };

  const submit = async () => {
    if (!draft.name.trim()) return toast.error("Name is required.");
    const total = Number(draft.total_price) || 0;
    const paid = Number(draft.paid_amount) || 0;
    const payload = {
      name: draft.name.trim(),
      phone: draft.phone || null,
      service_type: draft.service_type || null,
      total_price: total,
      paid_amount: paid,
      status: paid >= total && total > 0 ? "paid" : draft.status,
      notes: draft.notes || null,
    };
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, patch: payload });
        toast.success("Client updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Client added");
      }
      reset();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const startEdit = (c: Client) => {
    setEditing(c);
    setShowForm(true);
    setDraft({
      name: c.name,
      phone: c.phone ?? "",
      service_type: c.service_type ?? "",
      total_price: String(c.total_price),
      paid_amount: String(c.paid_amount),
      status: c.status,
      notes: c.notes ?? "",
    });
  };

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle="Manage clients, services and payments."
        action={
          <button onClick={() => (showForm ? reset() : setShowForm(true))} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-sm font-medium text-primary-foreground glow">
            <Plus className="h-4 w-4" /> {showForm ? "Close" : "Add Client"}
          </button>
        }
      />

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input placeholder="Client name *" className={inputClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <input placeholder="Phone" className={inputClass} value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
          <input placeholder="Service type" className={inputClass} value={draft.service_type} onChange={(e) => setDraft({ ...draft, service_type: e.target.value })} />
          <input type="number" step="0.01" placeholder="Total price" className={inputClass} value={draft.total_price} onChange={(e) => setDraft({ ...draft, total_price: e.target.value })} />
          <input type="number" step="0.01" placeholder="Paid amount" className={inputClass} value={draft.paid_amount} onChange={(e) => setDraft({ ...draft, paid_amount: e.target.value })} />
          <select className={inputClass} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <textarea placeholder="Notes" className={`sm:col-span-2 lg:col-span-2 ${inputClass}`} rows={2} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
          <button onClick={submit} disabled={create.isPending || update.isPending} className="px-4 py-2.5 rounded-xl gradient-primary text-sm font-medium text-primary-foreground disabled:opacity-60">
            {editing ? "Update" : "Save"}
          </button>
        </motion.div>
      )}

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Search clients…" value={q} onChange={(e)=>setQ(e.target.value)} className={`${inputClass} pl-9`} />
        </div>
        <select className={inputClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground bg-white/5">
              <tr>{["Client","Phone","Service","Total","Paid","Remaining","Status",""].map((h) => <th key={h} className="text-left font-medium px-5 py-3.5">{h}</th>)}</tr>
            </thead>
            <tbody>
              {list.isLoading && <tr><td colSpan={8} className="px-5 py-8 text-center text-muted-foreground">Loading…</td></tr>}
              {!list.isLoading && filtered.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">No clients.</td></tr>}
              {filtered.map((c) => {
                const remaining = Number(c.total_price) - Number(c.paid_amount);
                return (
                  <tr key={c.id} className="border-t border-glass-border hover:bg-white/[0.03]">
                    <td className="px-5 py-4 font-medium">{c.name}</td>
                    <td className="px-5 py-4 text-muted-foreground">{c.phone ?? "—"}</td>
                    <td className="px-5 py-4 text-muted-foreground">{c.service_type ?? "—"}</td>
                    <td className="px-5 py-4">${Number(c.total_price).toLocaleString()}</td>
                    <td className="px-5 py-4 text-success">${Number(c.paid_amount).toLocaleString()}</td>
                    <td className={`px-5 py-4 ${remaining > 0 ? "text-warning" : "text-muted-foreground"}`}>${remaining.toLocaleString()}</td>
                    <td className="px-5 py-4"><Badge tone={c.status === "paid" ? "success" : "warning"}>{c.status}</Badge></td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button onClick={() => startEdit(c)} className="text-xs text-muted-foreground hover:text-foreground mr-3">Edit</button>
                      <button onClick={() => remove.mutate(c.id)} className="p-2 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </>
  );
}
