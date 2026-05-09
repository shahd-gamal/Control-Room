import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { useAuth } from "@/lib/auth";
import { LoginScreen } from "@/components/LoginScreen";
import { migrateLocalStorage } from "@/lib/migrate";
import { useDueReminders } from "@/lib/notifications";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) migrateLocalStorage(user.id).catch(console.error);
  }, [user]);

  useDueReminders(user?.id);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass rounded-2xl px-6 py-4 text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <main className="flex-1 min-w-0 px-4 lg:px-6 pb-10">
        <TopNav onMenu={() => setOpen(true)} />
        <div className="pt-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
