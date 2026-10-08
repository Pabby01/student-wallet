-- 1. Create or configure 'receipts' private bucket in Supabase Storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  false,
  10485760, -- 10 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

-- Ensure storage policies exist (idempotent setup)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Users read own receipts'
  ) THEN
    CREATE POLICY "Users read own receipts" ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Users upload own receipts'
  ) THEN
    CREATE POLICY "Users upload own receipts" ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Users update own receipts'
  ) THEN
    CREATE POLICY "Users update own receipts" ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Users delete own receipts'
  ) THEN
    CREATE POLICY "Users delete own receipts" ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

-- 2. Performance indexes for core queries
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON public.expenses (category_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories (user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id_month ON public.budgets (user_id, month DESC);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_status ON public.savings_goals (user_id, status);
CREATE INDEX IF NOT EXISTS idx_alerts_user_unread ON public.alerts (user_id, was_read, created_at DESC);

-- 3. Automatic updated_at timestamp trigger for profiles
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
