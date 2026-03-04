import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: 'postgresql://postgres.bxkwonqrflctvbjskhmj:Vnq3wB5ocsMQJW5d@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('Conectado. Removendo FK antigas...');
    await client.query('ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_user_id_fkey;');
    await client.query('ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS fk_user_profile;');
    
    console.log('Adicionando FK correta...');
    await client.query('ALTER TABLE public.appointments ADD CONSTRAINT fk_user_profile FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;');
    
    console.log('Limpando cache do postgrest...');
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log('Pronto!');
  } catch (e) {
    console.error('ERRO:', e);
  } finally {
    await client.end();
  }
}

run();
