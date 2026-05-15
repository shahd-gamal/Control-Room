
CREATE TABLE public.passwords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL,
  email text,
  username text,
  password text NOT NULL,
  url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.passwords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own passwords all" ON public.passwords
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER passwords_set_updated_at
  BEFORE UPDATE ON public.passwords
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
