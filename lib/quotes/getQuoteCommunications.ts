import { requireAdminUser } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { QuoteCommunications } from './communications';

export async function getQuoteCommunications(quoteId: string): Promise<QuoteCommunications> {
  // History has no public read policy. Authorize before using the server client.
  const auth = await requireAdminUser();
  if (!auth.ok) return { messages: [], error: true };

  try {
    const { data, error } = await createAdminClient()
      .from('quote_status_history')
      .select('id, changed_at, note')
      .eq('quote_request_id', quoteId)
      .eq('changed_by', 'customer')
      .like('note', 'Customer message: %')
      .order('changed_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(100);
    if (error) throw error;
    return {
      messages: (data ?? []).map((row) => ({
        id: row.id,
        changed_at: row.changed_at,
        message: row.note.slice('Customer message: '.length),
      })),
      error: false,
    };
  } catch (error) {
    console.error('[quote-communications] Unable to load messages', error);
    return { messages: [], error: true };
  }
}
