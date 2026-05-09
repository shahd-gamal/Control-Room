import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Calendar, Clock, Plus, Trash2, User } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useLocalStorage, seed, uid, type Event } from "@/lib/storage";
import { useState } from "react";

export const Route = createFileRoute("/schedule")({
  head: () => ({ meta: [{ title: "Schedule — Nova" }] }),
  component: SchedulePage,
});

function SchedulePage() {
  const [events, setEvents] = useLocalStorage<Event[]>("events", seed.events);
  const [draft, setDraft] = useState<Omit<Event, "id">>({ title: "", date: "", time: "", client: "" });

  const add = () => {
    if (!draft.title || !draft.date) return;
    setEvents([...events, { id: uid(), ...draft }]);
    setDraft({ title: "", date: "", time: "", client: "" });
  };
  const remove = (id: string) => setEvents(events.filter((e) => e.id !== id));

  const sorted = [...events].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  return (
    <>
      <PageHeader title="Schedule" subtitle="Upcoming meetings, deadlines and milestones." />

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-5 gap-3">
        <input placeholder="Event title" className="sm:col-span-2 input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <input type="date" className="input" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
        <input type="time" className="input" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} />
        <div className="flex gap-2">
          <input placeholder="Client (opt.)" className="input flex-1" value={draft.client} onChange={(e) => setDraft({ ...draft, client: e.target.value })} />
          <button onClick={add} className="px-4 rounded-xl gradient-primary text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" /></button>
        </div>
        <style>{`.input{background:rgba(255,255,255,.05);border:1px solid var(--color-glass-border);border-radius:.75rem;padding:.65rem .85rem;font-size:.875rem;outline:none;color:inherit}.input:focus{border-color:var(--primary)}`}</style>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sorted.map((e, i) => (
          <motion.div key={e.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
            className="glass rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full gradient-primary opacity-10 blur-2xl" />
            <div className="flex items-start justify-between">
              <div className="h-11 w-11 rounded-xl gradient-primary grid place-items-center glow">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <button onClick={() => remove(e.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/15">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 font-semibold">{e.title}</div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{e.date}</span>
              {e.time && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{e.time}</span>}
            </div>
            {e.client && <div className="mt-2 text-xs inline-flex items-center gap-1 text-primary-glow"><User className="h-3 w-3" />{e.client}</div>}
          </motion.div>
        ))}
        {sorted.length === 0 && <div className="glass rounded-2xl p-10 text-center text-muted-foreground col-span-full">No events scheduled.</div>}
      </div>
    </>
  );
}
