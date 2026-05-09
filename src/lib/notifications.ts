import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const res = await Notification.requestPermission();
  return res === "granted";
}

export function notify(title: string, body?: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/favicon.ico" });
  } catch {
    /* ignore */
  }
}

/** Polls every minute for tasks/posts due within 10 minutes and notifies once each. */
export function useDueReminders(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;
    const seen = new Set<string>();

    const tick = async () => {
      if (Notification.permission !== "granted") return;
      const now = Date.now();
      const soon = now + 10 * 60 * 1000;

      const { data: tasks } = await supabase
        .from("tasks")
        .select("id,title,due_date,completed")
        .eq("completed", false)
        .not("due_date", "is", null);
      tasks?.forEach((t) => {
        if (!t.due_date) return;
        const due = new Date(t.due_date + "T09:00:00").getTime();
        const key = `task-${t.id}`;
        if (due >= now && due <= soon && !seen.has(key)) {
          seen.add(key);
          notify("Task due soon", t.title);
        }
      });

      const { data: posts } = await supabase
        .from("posts")
        .select("id,title,scheduled_at,status")
        .eq("status", "scheduled")
        .not("scheduled_at", "is", null);
      posts?.forEach((p) => {
        if (!p.scheduled_at) return;
        const due = new Date(p.scheduled_at).getTime();
        const key = `post-${p.id}`;
        if (due >= now && due <= soon && !seen.has(key)) {
          seen.add(key);
          notify("Facebook post coming up", p.title);
        }
      });
    };

    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [userId]);
}
