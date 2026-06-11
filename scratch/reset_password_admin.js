import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bxkwonqrflctvbjskhmj.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4a3dvbnFyZmxjdHZianNraG1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjYzMDQ0MSwiZXhwIjoyMDg4MjA2NDQxfQ.UdPa0mwEVMs-H2ssEY2YDFHgDvlIoHzvnL4NMsYsgoI'

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function resetPassword() {
  const userId = '297b46b9-abb1-44e5-bc9a-0c8f324f9e90' // teste@teste.com.br

  console.log('Redefinindo senha via Admin API...')
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    password: 'Teste1234'
  })

  if (error) {
    console.error('ERRO ao redefinir senha:', JSON.stringify(error, null, 2))
    return
  }

  console.log('Senha redefinida com sucesso para:', data.user.email)
  console.log('Testando login agora...')

  // Testar com anon key
  const supabaseAnon = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4a3dvbnFyZmxjdHZianNraG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzA0NDEsImV4cCI6MjA4ODIwNjQ0MX0.ZIKkzcdGXeXo2aaw3KuNuqqRwMpLYBc_8XX9tBZkyxM')
  
  const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
    email: 'teste@teste.com.br',
    password: 'Teste1234'
  })

  if (loginError) {
    console.error('ERRO no login após reset:', JSON.stringify(loginError, null, 2))
  } else {
    console.log('LOGIN OK! User:', loginData.user.email)
    console.log('ID:', loginData.user.id)
    await supabaseAnon.auth.signOut()
  }
}

resetPassword().catch(console.error)
