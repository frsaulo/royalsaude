BEGIN;

INSERT INTO auth.users (
  instance_id,
  id,
  role,
  aud,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test_simulate@example.com',
  'password_hash',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name": "Test Sim", "cpf": "123.456.789-00", "phone": "11999999999", "birth_date": "1990-01-01", "logradouro": "Rua Teste", "numero": "123", "cidade": "Sao Paulo", "estado": "SP", "cep": "01001-000", "account_type": "TITULAR", "dependents": []}',
  now(),
  now()
);

ROLLBACK;
