
-- Table for Request Availability form submissions
CREATE TABLE IF NOT EXISTS public.availability_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL,
  location TEXT NOT NULL,
  guest_count INTEGER,
  start_time TEXT,
  end_time TEXT,
  power_available TEXT,
  water_available TEXT,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'new'
);

ALTER TABLE public.availability_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts on availability_requests" 
  ON public.availability_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated reads on availability_requests" 
  ON public.availability_requests FOR SELECT USING (auth.role() = 'authenticated');


-- Table for Contact form submissions
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts on contact_submissions" 
  ON public.contact_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated reads on contact_submissions" 
  ON public.contact_submissions FOR SELECT USING (auth.role() = 'authenticated');
