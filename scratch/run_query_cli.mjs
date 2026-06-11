import { spawn } from 'child_process';

const sql = `
-- Primeiro apagar dados dependentes
DELETE FROM public.subscriptions WHERE user_id = '297b46b9-abb1-44e5-bc9a-0c8f324f9e90';
DELETE FROM public.payments WHERE user_id = '297b46b9-abb1-44e5-bc9a-0c8f324f9e90';
DELETE FROM public.appointments WHERE user_id = '297b46b9-abb1-44e5-bc9a-0c8f324f9e90';
DELETE FROM public.profiles WHERE id = '297b46b9-abb1-44e5-bc9a-0c8f324f9e90';
DELETE FROM auth.users WHERE id = '297b46b9-abb1-44e5-bc9a-0c8f324f9e90';
SELECT 'Usuário excluído com sucesso' as resultado;
`;

console.log("Iniciando execução da query via CLI usando child_process.spawn...");

const child = spawn('npx', ['supabase', 'db', 'query', '--linked'], {
  shell: true,
  stdio: ['pipe', 'inherit', 'inherit']
});

child.stdin.write(sql);
child.stdin.end();

child.on('exit', (code) => {
  console.log('Execução finalizada com código de saída:', code);
  process.exit(code);
});
