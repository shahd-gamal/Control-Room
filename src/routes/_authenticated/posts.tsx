import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Trash2, Search, Calendar, Image as ImageIcon } from "lucide-react";
import { Badge, PageHeader, inputClass } from "@/components/PageHeader";
import { usePosts, type Post } from "@/lib/db";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/posts")({
  head: () => ({ meta: [{ title: "FB Posts — Nova" }] }),
  component: PostsPage,
});

const STATUSES = ["draft", "scheduled", "posted"];

function localToIso(local: string) {
  return local ? new Date(local).toISOString() : null;
}
function isoToLocal(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

function PostsPage() {
  const { items, create, update, remove, list } = usePosts();
  const [editing, setEditing] = useState<Post | null>(null);
  const [draft, setDraft] = useState({ title: "", content: "", scheduled_at: "", status: "draft", image_url: "" });
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      items.filter(
        (p) =>
          (filter === "All" || p.status === filter) &&
          (q === "" || p.title.toLowerCase().includes(q.toLowerCase()) || (p.content ?? "").toLowerCase().includes(q.toLowerCase()))
      ),
    [items, filter, q]
  );

  const submit = async () => {
    if (!draft.title.trim()) return toast.error("Title is required.");
    const payload = {
      title: draft.title.trim(),
      content: draft.content || null,
      scheduled_at: localToIso(draft.scheduled_at),
      status: draft.status,
      image_url: draft.image_url || null,
    };
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, patch: payload });
        toast.success("Post updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Post added");
      }
      setEditing(null);
      setDraft({ title: "", content: "", scheduled_at: "", status: "draft", image_url: "" });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const startEdit = (p: Post) => {
    setEditing(p);
    setDraft({
      title: p.title,
      content: p.content ?? "",
      scheduled_at: isoToLocal(p.scheduled_at),
      status: p.status,
      image_url: p.image_url ?? "",
    });
  };

  const tone = (s: string) => (s === "posted" ? "success" : s === "scheduled" ? "info" : "default");

  return (
    <>
      <PageHeader title="Facebook Posts" subtitle="Plan, schedule and track your Facebook content." />

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input placeholder="Post title *" className={inputClass} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <input placeholder="Image URL (optional)" className={inputClass} value={draft.image_url} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} />
        <textarea placeholder="Post content…" rows={3} className={`sm:col-span-2 ${inputClass}`} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
        <input type="datetime-local" className={inputClass} value={draft.scheduled_at} onChange={(e) => setDraft({ ...draft, scheduled_at: e.target.value })} />
        <div className="flex gap-2">
          <select className={`flex-1 ${inputClass}`} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button onClick={submit} disabled={create.isPending || update.isPending} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-sm font-medium text-primary-foreground disabled:opacity-60">
            <Plus className="h-4 w-4" /> {editing ? "Update" : "Add"}
          </button>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        {["All", ...STATUSES].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${filter===f?"gradient-primary text-primary-foreground":"glass-strong text-muted-foreground hover:text-foreground"}`}>{f}</button>
        ))}
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Search posts…" value={q} onChange={(e)=>setQ(e.target.value)} className={`${inputClass} pl-9`} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {list.isLoading && <div className="glass rounded-2xl p-10 text-center text-muted-foreground col-span-full">Loading…</div>}
        {!list.isLoading && filtered.length === 0 && <div className="glass rounded-2xl p-10 text-center text-muted-foreground col-span-full">No posts.</div>}
        {filtered.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass rounded-2xl p-5 flex flex-col gap-3">
            {p.image_url && (
              <div className="aspect-video rounded-xl overflow-hidden bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
              </div>
            )}
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold truncate">{p.title}</div>
              <Badge tone={tone(p.status)}>{p.status}</Badge>
            </div>
            {p.content && <p className="text-sm text-muted-foreground line-clamp-3">{p.content}</p>}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {p.scheduled_at ? new Date(p.scheduled_at).toLocaleString() : "Not scheduled"}
              </span>
              {p.image_url && <ImageIcon className="h-3.5 w-3.5" />}
            </div>
            <div className="flex justify-end gap-1 -mb-1">
              <button onClick={() => startEdit(p)} className="text-xs text-muted-foreground hover:text-foreground px-2">Edit</button>
              <button onClick={() => remove.mutate(p.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/15">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
