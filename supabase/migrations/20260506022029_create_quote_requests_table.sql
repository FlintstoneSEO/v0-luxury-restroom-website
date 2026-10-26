-- Create quote_requests table for storing customer quote submissions
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert quote requests (public form submissions)
CREATE POLICY "Allow anonymous inserts" ON public.quote_requests
  FOR INSERT
  WITH CHECK (true);

-- Only authenticated admins can read quote requests (optional - for future admin panel)
CREATE POLICY "Allow authenticated reads" ON public.quote_requests
  FOR SELECT
  USING (auth.role() = 'authenticated');
