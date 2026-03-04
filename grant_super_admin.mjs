import pg from 'pg'
const { Client } = pg

const connectionString = "postgresql://postgres.bxkwonqrflctvbjskhmj:Vnq3wB5ocsMQJW5d@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require"

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
})

async function run() {
  try {
    await client.connect()
    console.log("Conectado direto no Banco de Dados via PG...")

    const emailToAdmin = 'master@royalsaude.com'
    const password = 'Royal123!@#' // Uma senha limpa para garantir que não haja erros de escape
    
    console.log(`[1] Injetando email ${emailToAdmin} diretamente na auth.users...`)
    
    // Check if exists first to avoid duplicate key violates
    const exists = await client.query(`SELECT id FROM auth.users WHERE email = $1`, [emailToAdmin])
    let targetId;

    if (exists.rows.length === 0) {
       const insertAuthQuery = await client.query(`
         INSERT INTO auth.users (
           instance_id, id, role, aud, email,
           encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at,
           raw_app_meta_data, raw_user_meta_data, created_at, updated_at
         ) VALUES (
           '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $1,
           extensions.crypt($2, extensions.gen_salt('bf')), now(), now(), now(),
           '{"provider":"email","providers":["email"]}', '{"name": "Admin Supremo"}', now(), now()
         ) RETURNING id
       `, [emailToAdmin, password]);
       targetId = insertAuthQuery.rows[0].id;
       console.log(`✅ Contada criada na base secreta do Supabase (ID: ${targetId})`)
    } else {
       targetId = exists.rows[0].id;
       console.log(`✅ Conta já existia (ID: ${targetId}). Atualizando a sua senha forçadamente...`)
       await client.query(`UPDATE auth.users SET encrypted_password = extensions.crypt($2, extensions.gen_salt('bf')), email_confirmed_at = now() WHERE id = $1`, [targetId, password])
    }

    console.log(`[2] Atualizando/Criando perfil com permissao ADM...`)
    const checkProfileQuery = await client.query(`SELECT * FROM public.profiles WHERE id = $1`, [targetId])

    if (checkProfileQuery.rows.length === 0) {
        await client.query(`INSERT INTO public.profiles (id, is_admin, full_name) VALUES ($1, true, 'Administrador Central')`, [targetId])
    } else {
        await client.query(`UPDATE public.profiles SET is_admin = true WHERE id = $1`, [targetId])
    }

    console.log('✅✅✅ Mágica concluída! Tudo 100% gravado no banco de dados com autoridade máxima.')

  } catch (e) {
    console.error('Falhou rodando a injeção SQL forçada:', e.message)
  } finally {
    await client.end()
  }
}

run()
