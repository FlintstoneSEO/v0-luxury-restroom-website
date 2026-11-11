import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({client:vi.fn(),send:vi.fn(),rpc:vi.fn()}));
vi.mock('@/lib/supabase/admin',()=>({createAdminClient:mocks.client}));
vi.mock('@/lib/email/client',()=>({sendEmail:mocks.send}));
vi.mock('@/lib/quote-approval',()=>({hashApprovalToken:()=> 'hash',isTokenExpired:()=>false}));
vi.mock('@/lib/app-origins',()=>({getAdminAppOrigin:()=> 'https://example.com'}));
import {POST} from '@/app/api/quote/[token]/respond/route';
describe('Customer response notification routing',()=>{
  beforeEach(()=>{
    vi.clearAllMocks();
    mocks.rpc.mockResolvedValue({data:[{result_ok:true}],error:null});
    mocks.send.mockResolvedValue({sent:true,provider:'resend'});
    mocks.client.mockReturnValue({rpc:mocks.rpc,from:(table:string)=>{
      const builder={select:()=>builder,eq:()=>builder,neq:async()=>({data:[],error:null}),single:async()=>({data:table==='quote_approval_tokens'?{id:'token-1',quote_request_id:'quote-1',expires_at:'2099-01-01',used_at:null}:{id:'quote-1',quote_number:'Q-123',customer_name:'Customer',email:'customer@example.com',status:'quote_sent'},error:null})};
      return builder;
    }});
  });
  it.each(['approved','declined','change_requested'])('addresses replies to the customer for %s',async response_type=>{
    const response=await POST(new Request('https://example.com/api/quote/token/respond',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({response_type,comments:'Please adjust the delivery time.'})}),{params:Promise.resolve({token:'token'})});
    expect(response.status).toBe(200);
    expect(mocks.send).toHaveBeenCalledWith(expect.objectContaining({replyTo:'customer@example.com'}));
    expect(mocks.rpc).toHaveBeenCalledWith('submit_quote_response',expect.objectContaining({p_response_type:response_type}));
  });
});
