import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ auth: vi.fn(), upsert: vi.fn(), select: vi.fn(), from: vi.fn() }));
vi.mock('@/lib/admin-auth', () => ({ requireAdminUser: mocks.auth }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: mocks.from }) }));
import { PUT } from '@/app/api/admin/pricing/route';
function request(settings: unknown) { return new Request('http://localhost/api/admin/pricing', { method: 'PUT', body: JSON.stringify({ settings }) }); }
beforeEach(() => {
  vi.clearAllMocks(); mocks.auth.mockResolvedValue({ ok: true, user: { id: 'synthetic-admin' } });
  mocks.from.mockReturnValue({ upsert: mocks.upsert }); mocks.upsert.mockReturnValue({ select: mocks.select }); mocks.select.mockResolvedValue({ data: [], error: null });
});
describe('pricing save boundary', () => {
  it.each([401, 403])('rejects unauthorized access (%s) before touching data', async status => {
    mocks.auth.mockResolvedValue({ ok: false, response: new Response('Denied', { status }) });
    expect((await PUT(request({ base_price_100_guests: 1175 }))).status).toBe(status);
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it('rejects an invalid batch atomically', async () => {
    expect((await PUT(request({ base_price_100_guests: 1175, after_hours_cutoff_hour: 100 }))).status).toBe(400);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it('persists numeric rules in one authorized batch', async () => {
    expect((await PUT(request({ included_event_hours: 8, additional_event_hourly_rate: 100, event_time_policy_enabled: 1 }))).status).toBe(200);
    expect(mocks.upsert).toHaveBeenCalledOnce();
    expect(mocks.upsert.mock.calls[0][0]).toEqual(expect.arrayContaining([expect.objectContaining({ setting_key: 'included_event_hours', setting_value: 8 })]));
  });
  it('surfaces persistence failure without claiming success', async () => {
    mocks.select.mockResolvedValue({ error: { message: 'synthetic db failure' } });
    const response = await PUT(request({ deposit_percentage: 40 }));
    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ ok: false });
  });
});
