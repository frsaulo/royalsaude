import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.bxkwonqrflctvbjskhpe:Vnq3wB5ocsMQJW5d@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  
  console.log("Adding email to profiles...");
  await client.query(`
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
  `);

  console.log("Backfilling emails...");
  await client.query(`
    UPDATE public.profiles p
    SET email = u.email
    FROM auth.users u
    WHERE p.id = u.id;
  `);

  console.log("Updating handle_new_user trigger...");
  await client.query(`
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (id, full_name, cpf, phone, email)
      VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'cpf',
        NEW.raw_user_meta_data->>'phone',
        NEW.email
      );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);

  await client.query(`NOTIFY pgrst, 'reload schema';`);
  
  console.log("Database fixed successfully!");
  await client.end();
}

run().catch(console.error);
