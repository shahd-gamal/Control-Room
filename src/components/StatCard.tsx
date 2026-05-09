import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  positive = true,
  index = 0,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: string;
  positive?: boolean;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="glass rounded-2xl p-5 relative overflow-hidden group"
    >
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full gradient-primary opacity-10 blur-2xl group-hover:opacity-20 transition-opacity" />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-3xl font-bold mt-2 tracking-tight">{value}</div>
        </div>
        <div className="h-10 w-10 rounded-xl gradient-primary grid place-items-center glow">
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
      </div>
      {delta && (
        <div className={`mt-3 inline-flex items-center gap-1 text-xs font-medium ${positive ? "text-success" : "text-destructive"}`}>
          {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {delta}
        </div>
      )}
    </motion.div>
  );
}
