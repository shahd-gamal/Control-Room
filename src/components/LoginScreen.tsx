import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 6) {
      toast.error("Enter a valid email and a password (min 6 chars).");
      return;
    }
    setBusy(true);
    const fn = mode === "in" ? signIn : signUp;
    const { error } = await fn(email, password);
    setBusy(false);
    if (error) toast.error(error);
    else if (mode === "up") toast.success("Account created. You're in!");
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl w-full max-w-md p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-xl gradient-primary grid place-items-center glow">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <div className="text-xl font-bold">Nova</div>
            <div className="text-xs text-muted-foreground">Your personal business OS</div>
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">
          {mode === "in" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "in" ? "Sign in to access your dashboard." : "One account, all your work in one place."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60 transition-colors"
            autoComplete="email"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60 transition-colors"
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl gradient-primary text-sm font-semibold text-primary-foreground glow disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode((m) => (m === "in" ? "up" : "in"))}
          className="mt-5 text-xs text-muted-foreground hover:text-foreground w-full text-center"
        >
          {mode === "in" ? "No account? Create one →" : "Already have an account? Sign in →"}
        </button>
      </motion.div>
    </div>
  );
}
