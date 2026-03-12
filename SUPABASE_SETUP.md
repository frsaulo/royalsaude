# Configuração do Supabase - Royal Saúde

Para que o sistema de login e agenda funcione, você precisa configurar as variáveis do Supabase corretamente no arquivo `.env.local`.

## Passo a Passo

1.  Acesse o [Dashboard do Supabase](https://app.supabase.com/).
2.  Selecione o seu projeto (ou crie um novo se ainda não o fez).
3.  No menu lateral esquerdo, clique no ícone de engrenagem (**Project Settings**).
4.  Clique em **API**.
5.  Em **Project API Keys**, procure por:
    *   `Project URL`: Copie este valor.
    *   `anon public`: Copie este valor (esta é a sua **Anon Key**).
6.  Abra o arquivo `.env.local` na raiz do seu projeto.
7.  Substitua os valores:
    *   `VITE_SUPABASE_URL`: Cole a URL que você copiou.
    *   `VITE_SUPABASE_ANON_KEY`: Cole a Anon Key que você copiou.
8.  Reinicie o servidor de desenvolvimento (`npm run dev`).

## Observação Importante
O erro que estava ocorrendo era porque a `VITE_SUPABASE_ANON_KEY` continha o valor da chave do Stripe, o que impedia a conexão com o banco de dados.

Após configurar as chaves, você poderá se cadastrar e fazer login normalmente.
