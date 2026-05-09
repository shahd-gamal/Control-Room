import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Briefcase, Calendar, ListChecks, Megaphone, Plus, TrendingUp, Users, Wallet } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Badge, PageHeader } from "@/components/PageHeader";
import { useExpenses, useIncome, useClients, usePosts, useTasks } from "@/lib/db";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({ meta: [{ title: "Dashboard — Nova" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const exp = useExpenses();
  const inc = useIncome();
  const clients = useClients();
  const posts = usePosts();
  const tasks = useTasks();

  const totalIncome = inc.items.reduce((a, b) => a + Number(b.amount), 0);
  const totalExpenses = exp.items.reduce((a, b) => a + Number(b.amount), 0);
  const profit = totalIncome - totalExpenses;
  const outstanding = clients.items.reduce((a, c) => a + (Number(c.total_price) - Number(c.paid_amount)), 0);

  const upcomingTasks = tasks.items.filter((t) => !t.completed).slice(0, 5);
  const upcomingPosts = posts.items
    .filter((p) => p.scheduled_at && new Date(p.scheduled_at) >= new Date())
    .slice(0, 5);
  const recentClientPayments = [...clients.items]
    .filter((c) => Number(c.paid_amount) > 0)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  const greeting = user?.email?.split("@")[0] ?? "there";

  return (
    <>
      <PageHeader
        title={`Welcome back, ${greeting}`}
        subtitle="A snapshot of your business today."
        action={
          <Link to="/income" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-sm font-medium text-primary-foreground glow hover:scale-[1.02] transition-transform">
            <Plus className="h-4 w-4" /> Log income
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Income" value={`$${totalIncome.toLocaleString()}`} icon={ArrowUpRight} delta="All time" index={0} />
        <StatCard label="Total Expenses" value={`$${totalExpenses.toLocaleString()}`} icon={ArrowDownRight} delta="All time" positive={false} index={1} />
        <StatCard label="Net Profit" value={`$${profit.toLocaleString()}`} icon={TrendingUp} delta={profit >= 0 ? "Healthy" : "Negative"} positive={profit >= 0} index={2} />
        <StatCard label="Outstanding" value={`$${outstanding.toLocaleString()}`} icon={Wallet} delta={`${clients.items.length} clients`} positive={outstanding === 0} index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5"><h2 className="font-semibold">Quick Actions</h2></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { to: "/clients", label: "Add Client", icon: Users },
              { to: "/tasks", label: "New Task", icon: ListChecks },
              { to: "/expenses", label: "Log Expense", icon: ArrowDownRight },
              { to: "/posts", label: "Schedule Post", icon: Megaphone },
            ].map((a) => (
              <Link key={a.label} to={a.to} className="group glass-strong rounded-xl p-4 flex flex-col items-start gap-3 hover:border-primary/40 transition-colors">
                <div className="h-9 w-9 rounded-lg gradient-primary grid place-items-center">
                  <a.icon className="h-4.5 w-4.5 text-primary-foreground" />
                </div>
                <div className="text-sm font-medium">{a.label}</div>
              </Link>
            ))}
          </div>

          <div className="mt-8 mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Upcoming Tasks</h2>
            <Link to="/tasks" className="text-xs text-muted-foreground hover:text-foreground">View all</Link>
          </div>
          <ul className="space-y-2">
            {upcomingTasks.length === 0 && <li className="text-sm text-muted-foreground py-4">No open tasks.</li>}
            {upcomingTasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between glass-strong rounded-xl px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{t.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Due {t.due_date ?? "—"}</div>
                </div>
                <Badge tone={t.priority === "High" ? "danger" : t.priority === "Medium" ? "warning" : "info"}>{t.priority}</Badge>
              </li>
            ))}
          </ul>

          <div className="mt-8 mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent Client Payments</h2>
            <Link to="/clients" className="text-xs text-muted-foreground hover:text-foreground">View all</Link>
          </div>
          <ul className="space-y-2">
            {recentClientPayments.length === 0 && <li className="text-sm text-muted-foreground py-4">No payments yet.</li>}
            {recentClientPayments.map((c) => (
              <li key={c.id} className="flex items-center justify-between glass-strong rounded-xl px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{c.service_type ?? "—"}</div>
                </div>
                <div className="text-sm text-success font-semibold">${Number(c.paid_amount).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.aside initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5"><h2 className="font-semibold">Upcoming Posts</h2></div>
          <ul className="space-y-3">
            {upcomingPosts.length === 0 && <li className="text-sm text-muted-foreground">Nothing scheduled.</li>}
            {upcomingPosts.map((e) => (
              <li key={e.id} className="flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl glass-strong grid place-items-center">
                  <Calendar className="h-4.5 w-4.5 text-primary-glow" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{e.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {e.scheduled_at ? new Date(e.scheduled_at).toLocaleString() : ""}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 p-4 rounded-xl gradient-primary text-primary-foreground">
            <Briefcase className="h-5 w-5" />
            <div className="font-semibold mt-2">This month profit</div>
            <div className="text-2xl font-bold mt-1">${profit.toLocaleString()}</div>
            <div className="text-xs opacity-80 mt-1">Income minus expenses</div>
          </div>
        </motion.aside>
      </div>
    </>
  );
}
