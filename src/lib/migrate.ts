import { supabase } from "@/integrations/supabase/client";

const FLAG = "nova_migrated_v1";

export async function migrateLocalStorage(userId: string) {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(FLAG)) return;

  const read = <T>(k: string): T[] | null => {
    try {
      const raw = localStorage.getItem(k);
      return raw ? (JSON.parse(raw) as T[]) : null;
    } catch {
      return null;
    }
  };

  // legacy clients (price/paid/project/status/deadline)
  const clients = read<{ name: string; project: string; price: number; paid: number; status: string; deadline: string }>("clients");
  if (clients?.length) {
    await supabase.from("clients").insert(
      clients.map((c) => ({
        user_id: userId,
        name: c.name,
        service_type: c.project,
        total_price: Number(c.price) || 0,
        paid_amount: Number(c.paid) || 0,
        status: c.status === "Completed" ? "paid" : "pending",
        notes: `Deadline: ${c.deadline || "—"}`,
      }))
    );
  }

  const tasks = read<{ title: string; priority: string; due: string; status: string }>("tasks");
  if (tasks?.length) {
    await supabase.from("tasks").insert(
      tasks.map((t) => ({
        user_id: userId,
        title: t.title,
        priority: t.priority || "Medium",
        due_date: t.due || null,
        status: t.status || "Todo",
        completed: t.status === "Done",
      }))
    );
  }

  const tx = read<{ label: string; amount: number; type: "income" | "expense"; date: string }>("tx");
  if (tx?.length) {
    const incomes = tx.filter((t) => t.type === "income");
    const expenses = tx.filter((t) => t.type === "expense");
    if (incomes.length)
      await supabase.from("income").insert(
        incomes.map((t) => ({ user_id: userId, source: t.label, amount: Number(t.amount) || 0, date: t.date || new Date().toISOString().slice(0, 10) }))
      );
    if (expenses.length)
      await supabase.from("expenses").insert(
        expenses.map((t) => ({ user_id: userId, category: t.label, amount: Number(t.amount) || 0, date: t.date || new Date().toISOString().slice(0, 10) }))
      );
  }

  localStorage.setItem(FLAG, "1");
}
