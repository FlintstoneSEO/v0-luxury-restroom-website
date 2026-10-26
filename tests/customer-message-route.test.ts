import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({client:vi.fn(), send:vi.fn(), expired:vi.fn(), save:vi.fn(), track:vi.fn()}));
vi.mock('@/lib/supabase/admin', () => ({createAdminClient:mocks.client}));
vi.mock('@/lib/email/client', () => ({sendEmail:mocks.send}));
vi.mock('@/lib/quote-approval', () => ({hashApprovalToken:()=>'hash', isTokenExpired:mocks.expired}));
vi.mock('@/lib/app-origins', () => ({getAdminAppOrigin:()=> 'https://example.com'}));
import { POST } from '@/app/api/quote/[token]/message/route';
const request = () => POST(new Request('https://example.com/api/quote/token/message',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'Is delivery included?'})}),{params:Promise.resolve({token:'token'})});
describe('Customer question persistence and notification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.expired.mockReturnValue(false);
    mocks.save.mockResolvedValue({error:null});
    mocks.track.mockResolvedValue({error:null});
    mocks.send.mockResolvedValue({sent:true,provider:'resend'});
    mocks.client.mockReturnValue({from:(table:string) => {
      if(table==='quote_status_history') return {insert:mocks.save};
      if(table==='quote_link_events') return {insert:mocks.track};
      const builder = {select:()=>builder,eq:()=>builder,single:async()=>({data:table==='quote_approval_tokens'?{id:'token-1',quote_request_id:'quote-1',expires_at:'2099-01-01'}:{id:'quote-1',quote_number:'Q-123',customer_name:'Customer',email:'customer@example.com',status:'quote_sent'},error:null})};
      return builder;
    }});
  });
  it('sets Reply-To to the customer and retains the question without changing status', async () => {
    expect((await request()).status).toBe(200);
    expect(mocks.send).toHaveBeenCalledWith(expect.objectContaining({replyTo:'customer@example.com'}));
    expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({old_status:'quote_sent',new_status:'quote_sent',note:'Customer message: Is delivery included?'}));
  });
  it('rejects expired links without saving or emailing', async () => {
    mocks.expired.mockReturnValue(true);
    expect((await request()).status).toBe(400);
    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it('does not acknowledge or email an unsaved question', async () => {
    mocks.save.mockResolvedValue({error:{message:'write failed'}});
    expect((await request()).status).toBe(500);
    expect(mocks.send).not.toHaveBeenCalled();
    expect(mocks.track).not.toHaveBeenCalled();
  });
  it.each(['throw','return'])('keeps a saved question successful when the email provider fails (%s)', async mode => {
    if(mode==='throw') mocks.send.mockRejectedValue(new Error('offline'));
    else mocks.send.mockResolvedValue({sent:false,error:'offline'});
    expect((await request()).status).toBe(200);
    expect(mocks.save).toHaveBeenCalledOnce();
  });
});
