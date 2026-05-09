import { Bell, Menu } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { requestNotificationPermission } from "@/lib/notifications";

export function TopNav({ onMenu }: { onMenu: () => void }) {
  const { user } = useAuth();
  const initial = (user?.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-20 -mx-4 lg:-mx-6 px-4 lg:px-6 py-4 backdrop-blur-xl bg-background/40 border-b border-glass-border">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="lg:hidden p-2 rounded-lg hover:bg-white/10">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex-1" />
        <button
          onClick={() => requestNotificationPermission()}
          title="Enable reminders"
          className="relative p-2.5 rounded-xl glass hover:bg-white/10"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary-glow" />
        </button>
        <div className="hidden sm:flex items-center gap-2 pl-2">
          <div className="h-9 w-9 rounded-full gradient-primary grid place-items-center text-sm font-semibold text-primary-foreground">
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
