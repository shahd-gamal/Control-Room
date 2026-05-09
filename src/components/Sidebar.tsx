import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, Wallet, ListChecks, Calendar, RefreshCw, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/finance", label: "Finance", icon: Wallet },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/schedule", label: "Schedule", icon: Calendar },
  { to: "/revisions", label: "Revisions", icon: RefreshCw },
] as const;

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-72 shrink-0 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="m-3 lg:m-4 h-[calc(100vh-1.5rem)] lg:h-[calc(100vh-2rem)] glass rounded-2xl flex flex-col p-4">
          <div className="flex items-center justify-between mb-8 px-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl gradient-primary grid place-items-center glow">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="leading-tight">
                <div className="font-semibold">Nova</div>
                <div className="text-xs text-muted-foreground">Business OS</div>
              </div>
            </Link>
            <button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            {items.map((it) => {
              const active = path === it.to;
              const Icon = it.icon;
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  onClick={onClose}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 rounded-xl gradient-primary opacity-90 -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="h-4.5 w-4.5" />
                  <span className="font-medium">{it.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="glass-strong rounded-xl p-4 mt-4">
            <div className="text-xs text-muted-foreground">Plan</div>
            <div className="font-semibold mt-1">Pro Workspace</div>
            <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-3/4 gradient-primary rounded-full" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">75% storage used</div>
          </div>
        </div>
      </aside>
    </>
  );
}
