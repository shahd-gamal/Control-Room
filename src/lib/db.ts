import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type Expense = { id: string; user_id: string; category: string; amount: number; date: string; notes: string | null; created_at: string };
export type Income = { id: string; user_id: string; source: string; amount: number; date: string; notes: string | null; created_at: string };
export type Client = { id: string; user_id: string; name: string; phone: string | null; service_type: string | null; total_price: number; paid_amount: number; status: string; notes: string | null; created_at: string };
export type Post = { id: string; user_id: string; title: string; content: string | null; scheduled_at: string | null; status: string; image_url: string | null; created_at: string };
export type Task = { id: string; user_id: string; title: string; priority: string; due_date: string | null; status: string; completed: boolean; created_at: string };

type Tables = {
  expenses: Expense;
  income: Income;
  clients: Client;
  posts: Post;
  tasks: Task;
};

function makeResource<K extends keyof Tables>(table: K, orderBy: string, ascending = false) {
  return function useResource() {
    const qc = useQueryClient();
    const { user } = useAuth();

    const list = useQuery({
      queryKey: [table, user?.id],
      enabled: !!user,
      queryFn: async () => {
        const { data, error } = await supabase.from(table).select("*").order(orderBy, { ascending });
        if (error) throw error;
        return (data ?? []) as Tables[K][];
      },
    });

    const create = useMutation({
      mutationFn: async (row: Partial<Tables[K]>) => {
        if (!user) throw new Error("Not authenticated");
        const { data, error } = await supabase
          .from(table)
          .insert({ ...row, user_id: user.id } as never)
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
    });

    const update = useMutation({
      mutationFn: async ({ id, patch }: { id: string; patch: Partial<Tables[K]> }) => {
        const { data, error } = await supabase.from(table).update(patch as never).eq("id", id).select().single();
        if (error) throw error;
        return data;
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
    });

    const remove = useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from(table).delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
    });

    return { list, create, update, remove, items: list.data ?? [] };
  };
}

export const useExpenses = makeResource("expenses", "date");
export const useIncome = makeResource("income", "date");
export const useClients = makeResource("clients", "created_at");
export const usePosts = makeResource("posts", "scheduled_at", true);
export const useTasks = makeResource("tasks", "due_date", true);
