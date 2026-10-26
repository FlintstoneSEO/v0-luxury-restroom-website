import { createAdminClient } from '@/lib/supabase/admin';
import type { CalendarBlock } from '@/lib/calendar-blocks';

export async function getCalendarBlocks() {
  const { data, error } = await createAdminClient().from('availability_blocks')
    .select('id,title,start_date,end_date,block_type,availability_effect,status,organization_name,created_at,updated_at')
    .eq('status', 'active').order('start_date', { ascending: true });
  return { blocks: (data ?? []) as CalendarBlock[], error: error ? 'Reserved partner dates could not be loaded. The calendar may be incomplete.' : undefined };
}
