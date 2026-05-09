import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

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
      transition={{ delay: index * 0.05 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl font-bold">{value}</div>
        </div>
        <div className="h-10 w-10 rounded-xl gradient-primary grid place-items-center">
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
      </div>
      {delta && (
        <div className={`mt-3 text-xs ${positive ? "text-success" : "text-warning"}`}>{delta}</div>
      )}
    </motion.div>
  );
}
