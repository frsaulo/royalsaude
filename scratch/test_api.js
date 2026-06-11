const url = 'https://bxkwonqrflctvbjskhmj.supabase.co/rest/v1/profiles';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4a3dvbnFyZmxjdHZianNraG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzA0NDEsImV4cCI6MjA4ODIwNjQ0MX0.ZIKkzcdGXeXo2aaw3KuNuqqRwMpLYBc_8XX9tBZkyxM';

async function test() {
  const response = await fetch(url, {
    headers: {
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`
    }
  });
  console.log('Status:', response.status);
  console.log('Headers:', Object.fromEntries(response.headers.entries()));
  const text = await response.text();
  console.log('Body:', text);
}

test().catch(console.error);
