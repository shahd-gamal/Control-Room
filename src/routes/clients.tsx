import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { Badge, PageHeader } from "@/components/PageHeader";
import { useLocalStorage, seed, uid, type Client } from "@/lib/storage";
import { useState } from "react";

export const Route = createFileRoute("/clients")({
  head: () => ({ meta: [{ title: "Clients — Nova" }] }),
  component: ClientsPage,
});

function ClientsPage() {
  const [clients, setClients] = useLocalStorage<Client[]>("clients", seed.clients);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Omit<Client, "id">>({
    name: "", project: "", price: 0, paid: 0, status: "Active", deadline: ""
  });

  const add = () => {
    if (!draft.name) return;
    setClients([...clients, { id: uid(), ...draft }]);
    setDraft({ name: "", project: "", price: 0, paid: 0, status: "Active", deadline: "" });
    setShowForm(false);
  };
  const remove = (id: string) => setClients(clients.filter(c => c.id !== id));

  const tone = (s: Client["status"]) =>
    s === "Active" ? "info" : s === "Completed" ? "success" : s === "Pending" ? "warning" : "default";

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle="Manage your client roster, payments and deadlines."
        action={
          <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-sm font-medium text-primary-foreground glow">
            <Plus className="h-4 w-4" /> Add Client
          </button>
        }
      />

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <input placeholder="Client name" className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <input placeholder="Project" className="input" value={draft.project} onChange={(e) => setDraft({ ...draft, project: e.target.value })} />
          <input type="number" placeholder="Price" className="input" value={draft.price || ""} onChange={(e) => setDraft({ ...draft, price: +e.target.value })} />
          <input type="number" placeholder="Paid" className="input" value={draft.paid || ""} onChange={(e) => setDraft({ ...draft, paid: +e.target.value })} />
          <select className="input" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Client["status"] })}>
            <option>Active</option><option>Pending</option><option>Completed</option><option>On Hold</option>
          </select>
          <div className="flex gap-2">
            <input type="date" className="input flex-1" value={draft.deadline} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} />
            <button onClick={add} className="px-4 rounded-xl gradient-primary text-sm font-medium text-primary-foreground">Save</button>
          </div>
          <style>{`.input{background:rgba(255,255,255,.05);border:1px solid var(--color-glass-border);border-radius:.75rem;padding:.65rem .85rem;font-size:.875rem;outline:none;color:inherit}.input:focus{border-color:var(--primary)}`}</style>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground bg-white/5">
              <tr>
                {["Client", "Project", "Price", "Paid", "Remaining", "Status", "Deadline", ""].map((h) => (
                  <th key={h} className="text-left font-medium px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-t border-glass-border hover:bg-white/[0.03] transition-colors">
                  <td className="px-5 py-4 font-medium">{c.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{c.project}</td>
                  <td className="px-5 py-4">${c.price.toLocaleString()}</td>
                  <td className="px-5 py-4 text-success">${c.paid.toLocaleString()}</td>
                  <td className="px-5 py-4 text-warning">${(c.price - c.paid).toLocaleString()}</td>
                  <td className="px-5 py-4"><Badge tone={tone(c.status)}>{c.status}</Badge></td>
                  <td className="px-5 py-4 text-muted-foreground">{c.deadline}</td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => remove(c.id)} className="p-2 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">No clients yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </>
  );
}
