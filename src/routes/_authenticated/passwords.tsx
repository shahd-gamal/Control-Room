import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Trash2, Search, Eye, EyeOff, Copy, ExternalLink } from "lucide-react";
import { PageHeader, inputClass } from "@/components/PageHeader";
import { usePasswords, type Password } from "@/lib/db";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/passwords")({
  head: () => ({ meta: [{ title: "Pass Sheet — Nova" }] }),
  component: PasswordsPage,
});

function PasswordsPage() {
  const { items, create, update, remove, list } = usePasswords();
  const [editing, setEditing] = useState<Password | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ label: "", email: "", username: "", password: "", url: "", notes: "" });
  const [q, setQ] = useState("");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const filtered = useMemo(
    () =>
      items.filter(
        (p) =>
          q === "" ||
          p.label.toLowerCase().includes(q.toLowerCase()) ||
          (p.email ?? "").toLowerCase().includes(q.toLowerCase()) ||
          (p.username ?? "").toLowerCase().includes(q.toLowerCase()) ||
          (p.url ?? "").toLowerCase().includes(q.toLowerCase())
      ),
    [items, q]
  );

  const reset = () => {
    setEditing(null);
    setDraft({ label: "", email: "", username: "", password: "", url: "", notes: "" });
    setShowForm(false);
  };

  const submit = async () => {
    if (!draft.label.trim()) return toast.error("Label is required.");
    if (!draft.password) return toast.error("Password is required.");
    const payload = {
      label: draft.label.trim(),
      email: draft.email || null,
      username: draft.username || null,
      password: draft.password,
      url: draft.url || null,
      notes: draft.notes || null,
    };
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, patch: payload });
        toast.success("Entry updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Entry saved");
      }
      reset();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const startEdit = (p: Password) => {
    setEditing(p);
    setShowForm(true);
    setDraft({
      label: p.label,
      email: p.email ?? "",
      username: p.username ?? "",
      password: p.password,
      url: p.url ?? "",
      notes: p.notes ?? "",
    });
  };

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <>
      <PageHeader
        title="Pass Sheet"
        subtitle="Save your logins so you never forget them."
        action={
          <button onClick={() => (showForm ? reset() : setShowForm(true))} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-sm font-medium text-primary-foreground glow">
            <Plus className="h-4 w-4" /> {showForm ? "Close" : "Add Entry"}
          </button>
        }
      />

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input placeholder="Label * (e.g. Gmail)" className={inputClass} value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
          <input placeholder="Email" className={inputClass} value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
          <input placeholder="Username" className={inputClass} value={draft.username} onChange={(e) => setDraft({ ...draft, username: e.target.value })} />
          <input placeholder="Password *" className={inputClass} value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} />
          <input placeholder="URL" className={inputClass} value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
          <textarea placeholder="Notes" className={`sm:col-span-2 lg:col-span-2 ${inputClass}`} rows={2} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
          <button onClick={submit} disabled={create.isPending || update.isPending} className="px-4 py-2.5 rounded-xl gradient-primary text-sm font-medium text-primary-foreground disabled:opacity-60">
            {editing ? "Update" : "Save"}
          </button>
        </motion.div>
      )}

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Search…" value={q} onChange={(e)=>setQ(e.target.value)} className={`${inputClass} pl-9`} />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground bg-white/5">
              <tr>{["Label","Email / Username","Password","URL",""].map((h) => <th key={h} className="text-left font-medium px-5 py-3.5">{h}</th>)}</tr>
            </thead>
            <tbody>
              {list.isLoading && <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">Loading…</td></tr>}
              {!list.isLoading && filtered.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">No saved logins yet.</td></tr>}
              {filtered.map((p) => {
                const isOpen = revealed[p.id];
                const id = p.email || p.username || "—";
                return (
                  <tr key={p.id} className="border-t border-glass-border hover:bg-white/[0.03] align-top">
                    <td className="px-5 py-4 font-medium">{p.label}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[180px]">{id}</span>
                        {id !== "—" && (
                          <button onClick={() => copy(id, "ID")} className="p-1 rounded hover:bg-white/10"><Copy className="h-3.5 w-3.5" /></button>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{isOpen ? p.password : "•".repeat(Math.min(p.password.length, 10))}</span>
                        <button onClick={() => setRevealed((r) => ({ ...r, [p.id]: !r[p.id] }))} className="p-1 rounded hover:bg-white/10">
                          {isOpen ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => copy(p.password, "Password")} className="p-1 rounded hover:bg-white/10"><Copy className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {p.url ? (
                        <a href={p.url.startsWith("http") ? p.url : `https://${p.url}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
                          <span className="truncate max-w-[160px]">{p.url}</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button onClick={() => startEdit(p)} className="text-xs text-muted-foreground hover:text-foreground mr-3">Edit</button>
                      <button onClick={() => remove.mutate(p.id)} className="p-2 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive">
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
