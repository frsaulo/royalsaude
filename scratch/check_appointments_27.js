import pkg from 'pg';
import { parse } from 'pg-connection-string';
const { Client } = pkg;

const config = parse('postgresql://postgres:Vnq3wB5ocsMQJW5d@db.bxkwonqrflctvbjskhmj.supabase.co:5432/postgres');
config.ssl = { rejectUnauthorized: false };

const client = new Client(config);

async function run() {
  await client.connect();
  console.log("Connected to Supabase DB!");

  console.log("\n--- Unique Indexes on public.appointments ---");
  const indexes = await client.query(`
    SELECT
        i.relname as index_name,
        ix.indisunique,
        pg_get_indexdef(ix.indexrelid) as index_def
    FROM
        pg_class t,
        pg_class i,
        pg_index ix
    WHERE
        t.oid = ix.indrelid
        AND i.oid = ix.indexrelid
        AND t.relkind = 'r'
        AND t.relname = 'appointments';
  `);
  console.table(indexes.rows);

  console.log("\n--- Appointments on 2026-05-27 ---");
  const appointments = await client.query(`
    SELECT id, user_id, patient_name, phone, date, time, type, specialty, created_at
    FROM public.appointments
    WHERE date = '2026-05-27'
    ORDER BY time;
  `);
  console.table(appointments.rows);

  await client.end();
}

run().catch(console.error);
