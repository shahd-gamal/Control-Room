import { Bell, Menu, Search } from "lucide-react";

export function TopNav({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-20 -mx-4 lg:-mx-6 px-4 lg:px-6 py-4 backdrop-blur-xl bg-background/40 border-b border-glass-border">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="lg:hidden p-2 rounded-lg hover:bg-white/10">
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search clients, tasks..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-glass-border text-sm outline-none focus:border-primary/60 transition-colors"
          />
        </div>
        <button className="relative p-2.5 rounded-xl glass hover:bg-white/10">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary-glow" />
        </button>
        <div className="hidden sm:flex items-center gap-2 pl-2">
          <div className="h-9 w-9 rounded-full gradient-primary grid place-items-center text-sm font-semibold text-primary-foreground">
            JD
          </div>
          <div className="leading-tight hidden md:block">
            <div className="text-sm font-medium">Jordan Doe</div>
            <div className="text-xs text-muted-foreground">Freelancer</div>
          </div>
        </div>
      </div>
    </header>
  );
}
