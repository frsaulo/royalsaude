-- ATUALIZAÇÃO DO TRIGGER DE CRIAÇÃO DE USUÁRIOS (SUPABASE SQL EDITOR)
-- Copie todo o código abaixo e execute no SQL Editor do seu painel do Supabase.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, cpf, phone, email, account_type, dependents, address, birth_date)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'cpf',
    NEW.raw_user_meta_data->>'phone',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'TITULAR'),
    COALESCE(NEW.raw_user_meta_data->'dependents', '[]'::jsonb),
    -- Endereço concatenado incluindo o complemento opcional se fornecido
    COALESCE(NEW.raw_user_meta_data->>'logradouro', '') || ', ' || 
    COALESCE(NEW.raw_user_meta_data->>'numero', '') || 
    CASE 
      WHEN NEW.raw_user_meta_data->>'complemento' IS NOT NULL AND NEW.raw_user_meta_data->>'complemento' <> '' 
      THEN ' - ' || (NEW.raw_user_meta_data->>'complemento') 
      ELSE '' 
    END || ' - ' || 
    COALESCE(NEW.raw_user_meta_data->>'cidade', '') || '/' || 
    COALESCE(NEW.raw_user_meta_data->>'estado', '') || ', CEP: ' || 
    COALESCE(NEW.raw_user_meta_data->>'cep', ''),
    NEW.raw_user_meta_data->>'birth_date'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Força a recarga do cache do PostgREST
NOTIFY pgrst, 'reload schema';
