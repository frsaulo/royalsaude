import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bxkwonqrflctvbjskhmj.supabase.co'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4a3dvbnFyZmxjdHZianNraG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzA0NDEsImV4cCI6MjA4ODIwNjQ0MX0.ZIKkzcdGXeXo2aaw3KuNuqqRwMpLYBc_8XX9tBZkyxM'

const supabase = createClient(supabaseUrl, anonKey)

async function run() {
  // Passo 1: Criar a conta via signUp (este fluxo sabemos que funciona)
  console.log('Criando conta teste@teste.com.br com senha Teste1234...')
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: 'teste@teste.com.br',
    password: 'Teste1234',
    options: {
      data: {
        full_name: 'Usuário de Teste',
        cpf: '000.000.000-00',
        phone: '11999999999',
        birth_date: '1990-01-01',
        cidade: 'São Paulo',
        estado: 'SP',
        logradouro: 'Rua Teste',
        numero: '1',
        complemento: '',
        cep: '01001-000',
        account_type: 'TITULAR',
        dependents: []
      }
    }
  })

  if (signUpError) {
    console.error('ERRO no cadastro:', signUpError.message)
    return
  }

  console.log('Conta criada! ID:', signUpData.user?.id)
  console.log('Sessão ativa:', !!signUpData.session)

  // Passo 2: Testar login
  console.log('\nTestando login...')
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'teste@teste.com.br',
    password: 'Teste1234'
  })

  if (loginError) {
    console.error('ERRO no login:', loginError.message, '| code:', loginError.code, '| status:', loginError.status)
    return
  }

  console.log('LOGIN OK! User:', loginData.user.email)
  console.log('ID:', loginData.user.id)

  // Passo 3: Ler o perfil
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('full_name, is_admin, email')
    .eq('id', loginData.user.id)
    .single()

  if (profileErr) {
    console.error('Erro ao ler profile:', profileErr.message)
  } else {
    console.log('Profile:', profile)
  }

  await supabase.auth.signOut()
  console.log('\n✅ SUCESSO! Usuário teste@teste.com.br recriado e funcionando com senha Teste1234')
}

run().catch(console.error)
