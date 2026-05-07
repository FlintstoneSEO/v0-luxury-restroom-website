import { NextResponse } from 'next/server';

export async function GET() {
  // Use the Postgres connection string to run migrations
  const connectionString = process.env.POSTGRES_URL_NON_POOLING;
  
  if (!connectionString) {
    return NextResponse.json({ 
      ok: false, 
      error: 'Database connection string not available'
    }, { status: 500 });
  }

  try {
    const { Client } = await import('pg');
    const client = new Client({ connectionString });
    
    await client.connect();

    const statements = [
      'alter table quote_requests add column if not exists travel_fee numeric not null default 0',
      'alter table quote_requests add column if not exists utility_fee numeric not null default 0',
      'alter table quote_requests add column if not exists after_hours_fee numeric not null default 0',
      'alter table quote_requests add column if not exists cleaning_fee numeric not null default 0',
      'alter table quote_requests add column if not exists damage_waiver_fee numeric not null default 0',
      'alter table quote_requests add column if not exists rush_booking_fee numeric not null default 0',
      'alter table quote_requests add column if not exists distance_miles numeric',
      'alter table quote_requests add column if not exists distance_surcharge numeric not null default 0',
      'alter table quote_requests add column if not exists discount_amount numeric not null default 0',
      'alter table quote_requests add column if not exists deposit_paid_amount numeric',
      'alter table quote_requests add column if not exists customer_response text',
      'alter table quote_requests add column if not exists customer_response_type text',
      'alter table quote_requests add column if not exists customer_response_at timestamptz',
      'alter table quote_requests add column if not exists quote_expires_at timestamptz',
      'alter table quote_requests add column if not exists deposit_transaction_reference text',
      'alter table quote_requests add column if not exists final_balance numeric',
      'alter table quote_requests add column if not exists is_manual_override boolean default false',
      'alter table quote_requests add column if not exists has_power boolean default false',
      'alter table quote_requests add column if not exists has_water boolean default false',
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

