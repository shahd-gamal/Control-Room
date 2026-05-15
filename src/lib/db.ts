import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type Expense = { id: string; user_id: string; category: string; amount: number; date: string; notes: string | null; created_at: string };
export type Income = { id: string; user_id: string; source: string; amount: number; date: string; notes: string | null; created_at: string };
export type Client = { id: string; user_id: string; name: string; phone: string | null; service_type: string | null; total_price: number; paid_amount: number; status: string; notes: string | null; created_at: string };
export type Post = { id: string; user_id: string; title: string; content: string | null; scheduled_at: string | null; status: string; image_url: string | null; created_at: string };
export type Task = { id: string; user_id: string; title: string; priority: string; due_date: string | null; status: string; completed: boolean; created_at: string };
export type Password = { id: string; user_id: string; label: string; email: string | null; username: string | null; password: string; url: string | null; notes: string | null; created_at: string };

type Tables = {
  expenses: Expense;
  income: Income;
  clients: Client;
  posts: Post;
  tasks: Task;
  passwords: Password;
};

function makeResource<K extends keyof Tables>(table: K, orderBy: string, ascending = false) {
  // Cast to any: we provide our own typed Row interfaces via Tables[K].
  const db = supabase as unknown as {
    from: (t: string) => {
      select: (s: string) => { order: (c: string, o: { ascending: boolean }) => Promise<{ data: unknown; error: { message: string } | null }> };
      insert: (row: unknown) => { select: () => { single: () => Promise<{ data: unknown; error: { message: string } | null }> } };
      update: (row: unknown) => { eq: (k: string, v: string) => { select: () => { single: () => Promise<{ data: unknown; error: { message: string } | null }> } } };
      delete: () => { eq: (k: string, v: string) => Promise<{ error: { message: string } | null }> };
    };
  };

  return function useResource() {
    const qc = useQueryClient();
    const { user } = useAuth();

    const list = useQuery({
      queryKey: [table, user?.id],
      enabled: !!user,
      queryFn: async () => {
        const { data, error } = await db.from(table).select("*").order(orderBy, { ascending });
        if (error) throw new Error(error.message);
        return (data ?? []) as Tables[K][];
      },
    });

    const create = useMutation({
      mutationFn: async (row: Partial<Tables[K]>) => {
        if (!user) throw new Error("Not authenticated");
        const { data, error } = await db.from(table).insert({ ...row, user_id: user.id }).select().single();
        if (error) throw new Error(error.message);
        return data as Tables[K];
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
    });

    const update = useMutation({
      mutationFn: async ({ id, patch }: { id: string; patch: Partial<Tables[K]> }) => {
        const { data, error } = await db.from(table).update(patch).eq("id", id).select().single();
        if (error) throw new Error(error.message);
        return data as Tables[K];
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
    });

    const remove = useMutation({
      mutationFn: async (id: string) => {
        const { error } = await db.from(table).delete().eq("id", id);
        if (error) throw new Error(error.message);
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
    });

    return { list, create, update, remove, items: (list.data ?? []) as Tables[K][] };
  };
}

export const useExpenses = makeResource("expenses", "date");
export const useIncome = makeResource("income", "date");
export const useClients = makeResource("clients", "created_at");
export const usePosts = makeResource("posts", "scheduled_at", true);
export const useTasks = makeResource("tasks", "due_date", true);
export const usePasswords = makeResource("passwords", "created_at");
