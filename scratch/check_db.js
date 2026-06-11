import pkg from 'pg';
import { parse } from 'pg-connection-string';
const { Client } = pkg;

const config = parse('postgresql://postgres:Vnq3wB5ocsMQJW5d@db.bxkwonqrflctvbjskhmj.supabase.co:5432/postgres');
config.ssl = { rejectUnauthorized: false };

const client = new Client(config);

async function run() {
  await client.connect();
  console.log("Connected successfully using manual config overrides!");
  
  console.log("--- COLUMNS IN public.profiles ---");
  const cols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles';
  `);
  console.log(cols.rows.map(r => r.column_name));

  console.log("\n--- TRIGGERS ON auth.users ---");
  const triggers = await client.query(`
    SELECT trigger_name, action_statement 
    FROM information_schema.triggers 
    WHERE event_object_table = 'users';
  `);
  console.log(triggers.rows);

  await client.end();
}

run().catch(console.error);
