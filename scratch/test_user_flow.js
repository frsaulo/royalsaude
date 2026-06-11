import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bxkwonqrflctvbjskhmj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4a3dvbnFyZmxjdHZianNraG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzA0NDEsImV4cCI6MjA4ODIwNjQ0MX0.ZIKkzcdGXeXo2aaw3KuNuqqRwMpLYBc_8XX9tBZkyxM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testFlow() {
  const email = 'test_normal_' + Math.random().toString(36).substring(7) + '@teste.com.br'
  const password = 'Teste123!@#'

  console.log(`Tentando cadastrar novo usuário: ${email}`)

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Usuário de Teste Antigravity',
        cpf: '123.456.789-11',
        phone: '11988888888',
        birth_date: '1990-01-01',
        cidade: 'São Paulo',
        estado: 'SP',
        logradouro: 'Avenida Paulista',
        numero: '1000',
        complemento: 'Apto 12',
        cep: '01311-100',
        account_type: 'TITULAR',
        dependents: []
      }
    }
  })

  if (signUpError) {
    console.error('Erro no Cadastro (signUp):', signUpError)
    return
  }

  console.log('Cadastro concluído com sucesso. ID do Usuário:', signUpData.user?.id)
  console.log('Sessão após cadastro existe?', !!signUpData.session)

  // Tentar fazer login explicitamente
  console.log('Tentando fazer login com o usuário criado...')
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (signInError) {
    console.error('Erro no Login (signIn):', signInError)
    return
  }

  console.log('Login concluído com sucesso. ID do Usuário Logado:', signInData.session?.user?.id)

  // Agora vamos tentar ler todas as tabelas públicas para ver qual causa erro
  const tables = ['profiles', 'appointments', 'plans', 'subscriptions', 'payments', 'coupons'];
  for (const table of tables) {
    console.log(`\nTentando ler da tabela: ${table}...`);
    try {
      let query = supabase.from(table).select('*');
      if (table === 'appointments') {
        // Tentar também sem filtro de id para ver se a política "Users can view appointments" quebra
        const { data, error } = await supabase.from('appointments').select('time').eq('date', '2026-05-21');
        console.log(`  Consulta appointments sem filtro de ID: status = ${error ? 'ERRO: ' + error.message : 'OK (' + data.length + ' rows)'}`);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error(`  Erro ao ler tabela ${table}:`, error.message, error.details, error.hint);
      } else {
        console.log(`  Sucesso ao ler tabela ${table}. Registros retornados:`, data.length);
      }
    } catch (e) {
      console.error(`  Exceção ao ler tabela ${table}:`, e.message);
    }
  }
}

testFlow().catch(console.error)
