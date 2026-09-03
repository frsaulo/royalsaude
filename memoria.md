# Memória do Projeto - Royal Saúde (RoyalMed)

> **Aviso Importante para a IA:** Este arquivo é a fonte permanente de memória e contexto acumulado do projeto. Sempre consulte este arquivo no início de cada nova sessão para manter a continuidade das tarefas, regras de negócio e arquitetura estabelecidas. **Mantenha este arquivo atualizado a cada nova funcionalidade implementada.**

---

## 📌 Informações Gerais do Projeto

- **Nome do Projeto**: Royal Saúde / RoyalMed Health
- **Repositório**: `d:\Cassio\Royal Sáude\royalsaude-src`
- **Stack Tecnológica**:
  - **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Radix UI / Shadcn UI, Lucide Icons, Sonner (Toasts).
  - **Backend / BaaS**: Supabase (PostgreSQL, Supabase Auth, Row Level Security, Edge Functions em Deno).
  - **Projeto Supabase Ref**: `bxkwonqrflctvbjskhmj`
  - **Pagamentos**: Integração com PagBank / Cartão / Boleto / PIX.

---

## 🏛️ Padrões e Regras de Negócio Estabelecidos

1. **Comunicação**: Falar em Português Brasileiro, direto, conciso e didático.
2. **Estilo & Design**:
   - Paleta de cores oficial: Azuis marinho/royal (`#1E3A8A`), Esmeralda/Verde (`emerald-600`), e Neutros (`slate-50` a `slate-900`).
   - **Regra do Banimento de Roxo**: Não utilizar tons roxos ou violetas na interface.
3. **Autenticação & Perfis**:
   - `auth.users`: Gerenciado pelo Supabase Auth.
   - `public.profiles`: Informações cadastrais do titular e dependentes (campo JSONB `dependents`), além da flag `is_admin`.
   - `public.subscriptions`: Controla o plano e o status da assinatura (`ACTIVE`, `PENDING`, `SUSPENDED`, `CANCELLED`, `EXPIRED`).
4. **Edge Functions Supabase**:
   - Localizadas em `supabase/functions/`.
   - Utilizam import `import { createClient } from "https://esm.sh/@supabase/supabase-js@2";` para deploy sem dependência de Docker local.
   - Deploy realizado com: `npx supabase functions deploy <nome-da-funcao> --no-verify-jwt`.

---

## 📜 Histórico de Solicitações e Funcionalidades Implementadas

### 0. Pacote de Deploy para Hospedagem Hostgator
- **Data**: 03/09/2026
- **Solicitação**: Preparar os arquivos compilados de produção em um arquivo `.zip` para upload no cPanel da Hostgator.
- **Arquivo Gerado**: `site-royal-saude-hostgator.zip` (1.85 MB) na raiz do projeto (atualizado).
- **Conteúdo**: Arquivos de `dist/` com `index.html`, `.htaccess` (configurado com regras de mod_rewrite para SPA React Router), `robots.txt`, `web.config`, `favicon.ico` e pasta `assets/`.

### 0.1. Filtros Avançados, Busca e Classificação na Gestão de Usuários
- **Data**: 03/09/2026
- **Solicitação**: Incluir pesquisa e filtros por tipo de vínculo, assinatura (ativa, suspensa, sem plano, etc.), adesão e contato para classificar a base de usuários.
- **Implementação**:
  - **Filtros dedicados**: Dropdowns para status de assinatura (`ACTIVE`, `SUSPENDED`, `PENDING`, `CANCELLED`, `EXPIRED`, `NONE`) e tipo de vínculo (Titulares vs Dependentes).
  - **Ordenação Dinâmica**: Por data de adesão (mais recentes / mais antigas), ordem alfabética (A-Z / Z-A) e status de assinatura.
  - **Busca Textual Expandida**: Normalização de texto sem acentos para pesquisar por telefone/contato (com e sem formatação), parentesco/vínculo, adesão e palavras-chave de status.
  - **Ações Rápidas**: Botão para limpar filtros e contador em tempo real de registros encontrados.
  - **Arquivo**: `src/pages/AdminUsers.tsx`.

### 1. Cadastro Manual de Usuários pelo Administrador (Sem Pagamento)
- **Data**: 03/09/2026
- **Solicitação do Usuário**: No painel administrativo em Gestão de Usuários, permitir que o administrador consiga cadastrar usuários sem a necessidade de passar pelo pagamento.
- **Decisões Acordadas**:
  - Senha: Admin pode digitar uma senha ou usar o gerador de senha segura.
  - Assinatura: Seleção do plano e status Ativo (`ACTIVE`) imediato, liberando o acesso sem cobrança.
  - Dependentes: Foco no Titular; dependentes adicionados via botão já existente.
- **Implementação Técnica**:
  - **Edge Function**: `supabase/functions/admin-create-user/index.ts`
    - Validação de JWT e permissão de admin (`is_admin: true`).
    - Criação do usuário no Auth via `adminClient.auth.admin.createUser` com `email_confirm: true`.
    - Upsert no `profiles` com nome, CPF, telefone, data de nascimento e endereço.
    - Criação de assinatura na tabela `subscriptions` vinculando o plano e status `ACTIVE`.
    - Deploy realizado com sucesso no Supabase.
  - **Frontend**: `src/pages/AdminUsers.tsx`
    - Botão **"+ Novo Usuário"** ao lado do total de registros.
    - Modal completo com máscaras de formatação (CPF, Telefone/WhatsApp, Data de Nascimento).
    - Botão **"Gerar senha segura"** que preenche automaticamente com senha aleatória.
    - Seleção de plano e status de assinatura.
    - Atualização imediata da tabela após cadastro.

---

### 2. Edição da Data de Adesão no Painel Administrativo
- **Solicitação**: Permitir que o administrador edite a data de adesão de usuários e dependentes diretamente na interface de Gestão de Usuários.
- **Implementação**:
  - Adicionadas funções de parsing e formatação para converter datas no formato legível (`DD/MM/AAAA`) e ISO para persistência.
  - Atualização do campo de data de adesão tanto para titulares quanto para registros de dependentes dentro do JSONB.

---

### 3. Ajustes e Expansão das Especialidades Médicas
- **Implementações**:
  - Unificação de Ginecologia e Obstetrícia em categoria única.
  - Novos ícones customizados e ordenação inteligente das especialidades.
  - Criação de páginas de detalhes dedicadas por especialidade com textos aprofundados para melhorar o SEO.
  - Inclusão de novas especialidades: Ultrassonografia, Psiquiatria e Serviços de Psicologia (Terapia ABA, TCC, Avaliação e Reabilitação Neuropsicológica).
  - Atualização do percentual de desconto de assinantes para até 80%.

---

### 4. Canais de Atendimento e Comunicação
- **Implementações**:
  - Inclusão do número oficial do SAC e ícones dedicados no Rodapé (`Footer`) e na seção de contato (`ContatoSection`).
  - Selo de "Atendimento Imediato" e atalhos rápidos para o WhatsApp comercial.

---

### 5. Documentos Legais e Contratuais
- **Implementações**:
  - Substituição do arquivo PDF do Contrato de Adesão pelo novo modelo oficial em `dist/assets` e `public/assets`.
  - Inserção dos termos de carência de 30 dias na Home Page.
  - Atualização dos arquivos de Políticas de Cancelamento, Termos de Uso e LGPD.

---

## 🔄 Diretrizes para Novas Sessões

Sempre que uma nova sessão for iniciada:
1. **Consulte este arquivo (`memoria.md`)** para resgatar o contexto do produto e as implementações anteriores.
2. Não modifique código fora do workspace oficial (`royalsaude-src`).
3. Ao finalizar qualquer nova solicitação, **registre o resumo no topo da seção de histórico deste arquivo**, garantindo que nenhuma informação seja perdida.
