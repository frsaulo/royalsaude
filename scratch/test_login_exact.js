import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bxkwonqrflctvbjskhmj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4a3dvbnFyZmxjdHZianNraG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzA0NDEsImV4cCI6MjA4ODIwNjQ0MX0.ZIKkzcdGXeXo2aaw3KuNuqqRwMpLYBc_8XX9tBZkyxM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
  console.log('Tentando login com teste@teste.com.br / Teste1234...')
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'teste@teste.com.br',
    password: 'Teste1234'
  })

  if (error) {
    console.error('ERRO DE AUTH:', JSON.stringify(error, null, 2))
    return
  }

  console.log('Login OK! User ID:', data.user.id)
  console.log('Access Token (primeiros 50 chars):', data.session.access_token.slice(0, 50))

  // Tentar fazer a mesma query que o frontend faz ao carregar a agenda
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (profileErr) {
    console.error('ERRO ao ler profile:', JSON.stringify(profileErr, null, 2))
  } else {
    console.log('Profile lido com sucesso:', profile.email, '| is_admin:', profile.is_admin)
  }

  // Tentar a query de assinatura que pode ser um ponto de falha
  const { data: sub, error: subErr } = await supabase
    .from('subscriptions')
    .select('*, plan:plans(*)')
    .eq('user_id', data.user.id)
    .in('status', ['ACTIVE', 'PENDING'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (subErr) {
    console.error('ERRO ao ler subscription:', JSON.stringify(subErr, null, 2))
  } else {
    console.log('Subscription:', sub ? `status=${sub.status}` : 'Nenhuma')
  }

  // Fazer logout
  await supabase.auth.signOut()
  console.log('\nTeste concluído.')
}

testLogin().catch(console.error)
