import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bxkwonqrflctvbjskhmj.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4a3dvbnFyZmxjdHZianNraG1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjYzMDQ0MSwiZXhwIjoyMDg4MjA2NDQxfQ.UdPa0mwEVMs-H2ssEY2YDFHgDvlIoHzvnL4NMsYsgoI'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4a3dvbnFyZmxjdHZianNraG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzA0NDEsImV4cCI6MjA4ODIwNjQ0MX0.ZIKkzcdGXeXo2aaw3KuNuqqRwMpLYBc_8XX9tBZkyxM'

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})
const anonClient = createClient(supabaseUrl, anonKey)

const OLD_USER_ID = '297b46b9-abb1-44e5-bc9a-0c8f324f9e90'
const EMAIL = 'teste@teste.com.br'
const NEW_PASSWORD = 'Teste1234'

async function recreateUser() {
  // Passo 1: Excluir o usuário corrompido via Admin API
  console.log('1. Excluindo usuário corrompido via Admin API...')
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(OLD_USER_ID)
  if (deleteError) {
    console.error('Erro ao excluir via Admin API:', deleteError.message)
    console.log('   Tentando excluir via SQL direto...')
    // Fallback: tentar deletar os dados do profile (o user será excluído por ON DELETE CASCADE)
  } else {
    console.log('   Usuário excluído com sucesso!')
  }

  // Esperar um pouco para garantir que a exclusão propagou
  await new Promise(r => setTimeout(r, 1000))

  // Passo 2: Criar novo usuário com email e senha corretos via Admin API
  console.log('2. Criando novo usuário via Admin API...')
  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email: EMAIL,
    password: NEW_PASSWORD,
    email_confirm: true,  // confirmar email automaticamente
    user_metadata: {
      full_name: 'Usuário de Teste',
      cpf: '000.000.000-00',
      phone: '11999999999',
      account_type: 'TITULAR',
    }
  })

  if (createError) {
    console.error('Erro ao criar usuário:', createError.message)
    return
  }

  console.log('   Novo usuário criado! ID:', newUser.user.id)

  // Passo 3: Inserir perfil na tabela profiles para o novo usuário
  console.log('3. Criando perfil para o novo usuário...')
  const { error: profileError } = await adminClient
    .from('profiles')
    .upsert({
      id: newUser.user.id,
      full_name: 'Usuário de Teste',
      cpf: '000.000.000-00',
      phone: '11999999999',
      email: EMAIL,
      account_type: 'TITULAR',
      dependents: [],
      address: 'Rua Teste, 1 - São Paulo/SP, CEP: 01001-000',
      birth_date: '1990-01-01',
      is_admin: false,
    }, { onConflict: 'id' })

  if (profileError) {
    console.log('   Aviso no perfil (pode ser normal se a trigger já criou):', profileError.message)
  } else {
    console.log('   Perfil criado com sucesso!')
  }

  // Passo 4: Migrar a assinatura do usuário antigo para o novo
  console.log('4. Migrando assinatura do usuário antigo para o novo...')
  const { error: subError } = await adminClient
    .from('subscriptions')
    .update({ user_id: newUser.user.id })
    .eq('user_id', OLD_USER_ID)

  if (subError) {
    console.log('   Aviso na assinatura:', subError.message)
  } else {
    console.log('   Assinatura migrada!')
  }

  // Passo 5: Testar o login
  console.log('5. Testando login com as novas credenciais...')
  await new Promise(r => setTimeout(r, 500))

  const { data: loginData, error: loginError } = await anonClient.auth.signInWithPassword({
    email: EMAIL,
    password: NEW_PASSWORD
  })

  if (loginError) {
    console.error('ERRO no login:', loginError.message, loginError.code)
  } else {
    console.log('LOGIN OK! User ID:', loginData.user.id)
    console.log('Email confirmado:', loginData.user.email_confirmed_at ? 'Sim' : 'Não')
    await anonClient.auth.signOut()
    console.log('\n✅ Tudo certo! Login com teste@teste.com.br / Teste1234 funcionando!')
  }
}

recreateUser().catch(console.error)
