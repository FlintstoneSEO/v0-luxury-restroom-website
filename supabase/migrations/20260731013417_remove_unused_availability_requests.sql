-- quote_requests is the operational source of truth for customer inquiries.
-- availability_requests was an empty legacy duplicate with no database consumers.
drop table if exists public.availability_requests;
