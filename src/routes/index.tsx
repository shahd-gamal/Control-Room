import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Briefcase, Calendar, DollarSign, ListChecks, Plus, Users, Wallet } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Badge, PageHeader } from "@/components/PageHeader";
import { useLocalStorage, seed } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — Nova" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [clients] = useLocalStorage("clients", seed.clients);
  const [tasks] = useLocalStorage("tasks", seed.tasks);
  const [tx] = useLocalStorage("tx", seed.tx);
  const [events] = useLocalStorage("events", seed.events);

  const income = tx.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const expenses = tx.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
  const outstanding = clients.reduce((a, c) => a + (c.price - c.paid), 0);
  const activeClients = clients.filter((c) => c.status === "Active").length;

  const recent = tasks.slice(0, 4);
  const upcoming = [...events].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);

  return (
    <>
      <PageHeader
        title="Welcome back, Jordan"
        subtitle="Here's what's happening with your business today."
        action={
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-sm font-medium text-primary-foreground glow hover:scale-[1.02] transition-transform">
            <Plus className="h-4 w-4" /> New Project
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`$${income.toLocaleString()}`} icon={DollarSign} delta="+12.4% this month" index={0} />
        <StatCard label="Outstanding" value={`$${outstanding.toLocaleString()}`} icon={Wallet} delta="3 invoices due" positive={false} index={1} />
        <StatCard label="Active Clients" value={String(activeClients)} icon={Users} delta="+2 this week" index={2} />
        <StatCard label="Open Tasks" value={String(tasks.filter(t => t.status !== "Done").length)} icon={ListChecks} delta="5 due soon" positive={false} index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <motion.section
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { to: "/clients", label: "Add Client", icon: Users },
              { to: "/tasks", label: "New Task", icon: ListChecks },
              { to: "/finance", label: "Log Expense", icon: Wallet },
              { to: "/schedule", label: "Schedule", icon: Calendar },
            ].map((a) => (
              <Link key={a.label} to={a.to}
                className="group glass-strong rounded-xl p-4 flex flex-col items-start gap-3 hover:border-primary/40 transition-colors"
              >
                <div className="h-9 w-9 rounded-lg gradient-primary grid place-items-center">
                  <a.icon className="h-4.5 w-4.5 text-primary-foreground" />
                </div>
                <div className="text-sm font-medium">{a.label}</div>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Tasks</h2>
            <Link to="/tasks" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="space-y-2">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center justify-between glass-strong rounded-xl px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{t.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Due {t.due}</div>
                </div>
                <Badge tone={t.priority === "High" ? "danger" : t.priority === "Medium" ? "warning" : "info"}>{t.priority}</Badge>
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">Upcoming Deadlines</h2>
          </div>
          <ul className="space-y-3">
            {upcoming.map((e) => (
              <li key={e.id} className="flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl glass-strong grid place-items-center">
                  <Calendar className="h-4.5 w-4.5 text-primary-glow" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{e.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{e.date} · {e.time}</div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 p-4 rounded-xl gradient-primary text-primary-foreground">
            <Briefcase className="h-5 w-5" />
            <div className="font-semibold mt-2">Monthly profit</div>
            <div className="text-2xl font-bold mt-1">${(income - expenses).toLocaleString()}</div>
            <div className="text-xs opacity-80 mt-1">Income minus expenses</div>
          </div>
        </motion.aside>
      </div>
    </>
  );
}
