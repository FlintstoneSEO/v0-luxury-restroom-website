import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ auth: vi.fn(), client: vi.fn(), result: {data: [] as unknown[], error: null as unknown} }));
vi.mock('@/lib/admin-auth', () => ({ requireAdminUser: mocks.auth }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: mocks.client }));
import { getQuoteCommunications } from '@/lib/quotes/getQuoteCommunications';

describe('Quote communications data boundary', () => {
  const query = {select: vi.fn(), eq: vi.fn(), like: vi.fn(), order: vi.fn(), limit: vi.fn()};
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ok: true});
    mocks.result = {data: [], error:null};
    for (const method of ['select','eq','like','order'] as const) query[method].mockReturnValue(query);
    query.limit.mockImplementation(() => Promise.resolve(mocks.result));
    mocks.client.mockReturnValue({from: vi.fn().mockReturnValue(query)});
  });
  it('never creates a privileged client for an unauthenticated or non-admin user', async () => {
    mocks.auth.mockResolvedValue({ok: false});
    expect(await getQuoteCommunications('quote-1')).toEqual({messages:[],error:true});
    expect(mocks.client).not.toHaveBeenCalled();
  });
  it('reads only this quote’s customer questions and removes the legacy prefix', async () => {
    mocks.result.data = [{id:'message-1', changed_at:'2026-10-26T12:00:00Z', note:'Customer message: Is power included?'}];
    expect(await getQuoteCommunications('quote-1')).toEqual({error:false,messages:[{id:'message-1',changed_at:'2026-10-26T12:00:00Z',message:'Is power included?'}]});
    expect(query.eq).toHaveBeenCalledWith('quote_request_id','quote-1');
    expect(query.eq).toHaveBeenCalledWith('changed_by','customer');
    expect(query.like).toHaveBeenCalledWith('note','Customer message: %');
    expect(query.order).toHaveBeenCalledWith('changed_at',{ascending:false});
  });
  it('surfaces database errors instead of pretending there are no messages', async () => {
    mocks.result.error = {message:'Database unavailable'};
    expect(await getQuoteCommunications('quote-1')).toEqual({messages:[],error:true});
  });
});
