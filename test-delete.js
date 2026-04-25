import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bxkwonqrflctvbjskhmj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4a3dvbnFyZmxjdHZianNraG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzA0NDEsImV4cCI6MjA4ODIwNjQ0MX0.ZIKkzcdGXeXo2aaw3KuNuqqRwMpLYBc_8XX9tBZkyxM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'master@royalsaude.com',
    password: 'Royal123!@#'
  })

  if (authError) {
    console.error('Auth Error:', authError)
    return
  }

  console.log('Logged in as:', authData.session.user.id)

  const { data, error } = await supabase.functions.invoke('admin-delete-user', {
    body: { userId: 'b1a8ef5c-4c6a-4b9f-a9f2-e0dfdf9ef2af' } // Test user
  })

  console.log('Response:', data, error)
}

test()
