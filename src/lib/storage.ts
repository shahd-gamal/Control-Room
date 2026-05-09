import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export type Client = {
  id: string;
  name: string;
  project: string;
  price: number;
  paid: number;
  status: "Active" | "Completed" | "Pending" | "On Hold";
  deadline: string;
};

export type Task = {
  id: string;
  title: string;
  priority: "Low" | "Medium" | "High";
  due: string;
  status: "Todo" | "In Progress" | "Done";
};

export type Tx = {
  id: string;
  label: string;
  amount: number;
  type: "income" | "expense";
  date: string;
};

export type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  client?: string;
};

export type Revision = {
  id: string;
  client: string;
  project: string;
  notes: string;
  status: "Pending" | "In Review" | "Approved";
  date: string;
};

export const seed = {
  clients: [
    { id: "c1", name: "Acme Corp", project: "Brand Refresh", price: 4500, paid: 2000, status: "Active", deadline: "2026-05-22" },
    { id: "c2", name: "Lumen Studio", project: "Website Redesign", price: 8200, paid: 8200, status: "Completed", deadline: "2026-04-30" },
    { id: "c3", name: "Northwind", project: "Mobile App UI", price: 12000, paid: 6000, status: "Active", deadline: "2026-06-10" },
    { id: "c4", name: "Pixelate", project: "Logo Suite", price: 1800, paid: 0, status: "Pending", deadline: "2026-05-28" },
  ] as Client[],
  tasks: [
    { id: "t1", title: "Send invoice to Acme Corp", priority: "High", due: "2026-05-12", status: "Todo" },
    { id: "t2", title: "Design homepage hero", priority: "Medium", due: "2026-05-15", status: "In Progress" },
    { id: "t3", title: "Client call — Northwind", priority: "High", due: "2026-05-10", status: "Todo" },
    { id: "t4", title: "Export final logos", priority: "Low", due: "2026-05-20", status: "Done" },
  ] as Task[],
  tx: [
    { id: "x1", label: "Acme Corp deposit", amount: 2000, type: "income", date: "2026-05-01" },
    { id: "x2", label: "Lumen final payment", amount: 4200, type: "income", date: "2026-04-29" },
    { id: "x3", label: "Adobe subscription", amount: 60, type: "expense", date: "2026-05-02" },
    { id: "x4", label: "Figma team", amount: 45, type: "expense", date: "2026-05-03" },
  ] as Tx[],
  events: [
    { id: "e1", title: "Kickoff — Pixelate", date: "2026-05-11", time: "10:00", client: "Pixelate" },
    { id: "e2", title: "Design review", date: "2026-05-13", time: "15:30", client: "Northwind" },
    { id: "e3", title: "Invoice deadline", date: "2026-05-14", time: "09:00", client: "Acme Corp" },
  ] as Event[],
  revisions: [
    { id: "r1", client: "Acme Corp", project: "Brand Refresh", notes: "Adjust primary color", status: "In Review", date: "2026-05-08" },
    { id: "r2", client: "Northwind", project: "Mobile App UI", notes: "Refine onboarding flow", status: "Pending", date: "2026-05-09" },
  ] as Revision[],
};

export const uid = () => Math.random().toString(36).slice(2, 10);
