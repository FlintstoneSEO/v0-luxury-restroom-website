import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';

export async function GET() {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'Migration runner is disabled in production.' }, { status: 410 });
  }

  // Use the Postgres connection string to run migrations
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    return NextResponse.json({ 
      ok: false, 
      error: 'Database connection string not available'
    }, { status: 500 });
  }

  try {
    const { Client } = await import('pg');
    
    // Parse the connection string and remove SSL parameters
    let connString = connectionString;
    if (connString.includes('?')) {
      const url = new URL(connString);
      // Remove SSL-related params that might cause issues
      url.searchParams.delete('sslmode');
      url.searchParams.delete('ssl');
      connString = url.toString();
    }
    
    const client = new Client({ 
      connectionString: connString,
      ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();

    const statements = [
      // Fee columns
      'alter table quote_requests add column if not exists travel_fee numeric not null default 0',
      'alter table quote_requests add column if not exists utility_fee numeric not null default 0',
      'alter table quote_requests add column if not exists after_hours_fee numeric not null default 0',
      'alter table quote_requests add column if not exists cleaning_fee numeric not null default 0',
      'alter table quote_requests add column if not exists damage_waiver_fee numeric not null default 0',
      'alter table quote_requests add column if not exists rush_booking_fee numeric not null default 0',
      'alter table quote_requests add column if not exists distance_miles numeric',
      'alter table quote_requests add column if not exists distance_surcharge numeric not null default 0',
      'alter table quote_requests add column if not exists discount_amount numeric not null default 0',
      'alter table quote_requests add column if not exists subtotal numeric not null default 0',
      'alter table quote_requests add column if not exists pretax_total numeric not null default 0',
      'alter table quote_requests add column if not exists taxable_amount numeric not null default 0',
      'alter table quote_requests add column if not exists tax_rate numeric not null default 0',
      'alter table quote_requests add column if not exists sales_tax_amount numeric not null default 0',
      'alter table quote_requests add column if not exists total_price numeric not null default 0',
      'alter table quote_requests add column if not exists deposit_percentage numeric not null default 0',
      'alter table quote_requests add column if not exists final_balance numeric',

      // Quote-option financial snapshot columns
      'alter table quote_options add column if not exists pretax_total numeric not null default 0',
      'alter table quote_options add column if not exists taxable_amount numeric not null default 0',
      'alter table quote_options add column if not exists tax_rate numeric not null default 0',
      'alter table quote_options add column if not exists sales_tax_amount numeric not null default 0',
      'alter table quote_options add column if not exists deposit_percentage numeric not null default 0',
      
      // Deposit columns
      'alter table quote_requests add column if not exists deposit_paid_amount numeric',
      'alter table quote_requests add column if not exists deposit_transaction_reference text',
      
      // Customer response columns
      'alter table quote_requests add column if not exists customer_response text',
      'alter table quote_requests add column if not exists customer_response_type text',
      'alter table quote_requests add column if not exists customer_response_at timestamptz',
      
      // Quote tracking columns
      'alter table quote_requests add column if not exists quote_expires_at timestamptz',
      'alter table quote_requests add column if not exists is_manual_override boolean default false',
      'alter table quote_requests add column if not exists needs_manual_distance_review boolean not null default false',
      
      // Utility access columns
      'alter table quote_requests add column if not exists has_power boolean default false',
      'alter table quote_requests add column if not exists has_water boolean default false',
      
      // Agreement columns - form expects signed_document_url (db has signed_agreement_url)
      'alter table quote_requests add column if not exists signed_document_url text',
      
      // Address columns - form expects separate fields
      'alter table quote_requests add column if not exists event_address text',
      'alter table quote_requests add column if not exists city text',
      'alter table quote_requests add column if not exists state text',
      'alter table quote_requests add column if not exists zip_code text',
      
      // Contact columns - form expects email/phone (db has customer_email/customer_phone)
      'alter table quote_requests add column if not exists email text',
      'alter table quote_requests add column if not exists phone text',
      
      // Additional notes column
      'alter table quote_requests add column if not exists additional_notes text',
    ];

    const results = [];
    const errors: { statement: string; error: string }[] = [];

    for (const statement of statements) {
      try {
        await client.query(statement);
        results.push({ statement, status: 'success' });
      } catch (err) {
        errors.push({ 
          statement, 
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }

    await client.end();

    return NextResponse.json({ 
      ok: errors.length === 0, 
      message: `${results.length} migrations successful, ${errors.length} failed`,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Migration error:', err);
    return NextResponse.json({ 
      ok: false, 
      error: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}
