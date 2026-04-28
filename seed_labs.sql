-- Create labs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.labs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  floor        text,
  seats        integer,
  department   text,
  available    boolean DEFAULT true,
  created_at   timestamptz DEFAULT now()
);

-- Truncate existing data to avoid duplicates (optional, comment out if you want to keep existing)
TRUNCATE TABLE public.labs CASCADE;

-- Insert initial lab data for CSE, IT, and ELEX
INSERT INTO public.labs (name, floor, seats, department, available) VALUES
  -- CSE Labs
  ('CSE LAB 1', 'Ground', 32, '05', true),
  ('IoT Innovation Lab', 'Ground', 25, '20', false),
  
  -- IT Labs
  ('IT LAB 1', 'Ground', 32, '12', true),
  ('IT LAB 2', 'Ground', 35, '12', true),
  ('IoT Innovation Lab', 'Ground', 25, '20', false),
  
  -- ELEX (Electronics) Labs
  ('Basic Electronics Lab', '1st', 25, '09', true),
  ('Drone Lab', '1st', 25, '09', true),
  ('IoT Innovation Lab', 'Ground', 25, '20', false),

-- Enable RLS and add basic policies if not already present
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'labs' AND policyname = 'Anyone can read labs'
    ) THEN
        CREATE POLICY "Anyone can read labs" ON public.labs FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'labs' AND policyname = 'Teachers can update labs'
    ) THEN
        CREATE POLICY "Teachers can update labs" ON public.labs FOR UPDATE USING (
            (SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin')
        );
    END IF;
END $$;
