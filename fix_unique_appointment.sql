-- Remover a restrição de chave única antiga (que impedia consultas em especialidades diferentes no mesmo horário)
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS unique_date_time;

-- Criar a nova restrição de chave única que considera a especialidade, a data e o horário
-- Isso permite atendimentos simultâneos em especialidades diferentes no mesmo horário
ALTER TABLE public.appointments ADD CONSTRAINT unique_specialty_date_time UNIQUE (specialty, date, "time");
