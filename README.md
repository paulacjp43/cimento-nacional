# GESTOBRA — Sistema de Relatório Diário de Obras

Sistema digital para elaboração, armazenamento, consulta e emissão de Relatórios Diários de Obra (RDO), com suporte multiempresa, múltiplos setores (Civil, Elétrica e Mecânica) e fluxo de aprovação completo.

---

## ✅ Fase 2 Concluída — Base do Projeto

### Tecnologias
- **Next.js 16** (App Router + Turbopack)
- **TypeScript 5** (strict mode)
- **Tailwind CSS 4**
- **Supabase** (Auth + PostgreSQL + Storage + RLS)
- **React Hook Form + Zod** (validação)
- **Sonner** (toasts)
- **Lucide React** (ícones)

---

## 🚀 Instalação e Configuração

### 1. Pré-requisitos
- Node.js 18+
- npm 9+
- Conta no Supabase

### 2. Clonar e instalar
```bash
cd gestobra
npm install
```

### 3. Variáveis de ambiente
Copie o arquivo de exemplo e preencha com suas credenciais:
```bash
cp .env.example .env.local
```

Edite `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ **NUNCA** exponha a `service_role` key no frontend. Use apenas a `anon` key.

### 4. Configurar o banco de dados
Execute as migrations SQL no painel do Supabase (SQL Editor) na ordem:
1. ENUMs e tipos
2. Tabelas core (companies, profiles, projects)
3. Tabelas de relatórios (daily_reports, sectors, activities)
4. Tabelas de suporte (occurrences, attachments, audit_logs)
5. Triggers
6. RLS policies
7. Storage bucket

### 5. Criar o primeiro usuário
Acesse o painel do Supabase → Authentication → Users → Create User

Após criar, atualize o perfil:
```sql
UPDATE profiles 
SET role = 'company_admin', company_id = 'SEU_COMPANY_ID', status = 'active'
WHERE email = 'seu@email.com';
```

### 6. Executar localmente
```bash
npm run dev
```
Acesse: http://localhost:3000

---

## 👥 Contas de Acesso

Para fins de segurança e conformidade, não fornecemos contas genéricas com senhas pré-configuradas no código.

Recomendamos que durante o desenvolvimento você crie suas próprias contas diretamente pelo painel do Supabase, utilizando e-mails fictícios (ex: `admin@example.com`, `gestor@example.com`) e definindo senhas seguras. Após a criação, você pode atribuir os perfis de acesso diretamente na tabela `profiles`.

---

## 📁 Estrutura do Projeto

```
gestobra/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Páginas de autenticação
│   │   ├── layout.tsx            # Layout split-panel
│   │   ├── login/                # Tela de login
│   │   ├── esqueci-senha/        # Recuperação de senha
│   │   └── redefinir-senha/      # Redefinição de senha
│   ├── (dashboard)/              # Área autenticada
│   │   ├── layout.tsx            # Layout com sidebar
│   │   └── dashboard/            # Dashboard principal
│   ├── acesso-negado/            # Página 403
│   ├── sessao-expirada/          # Sessão expirada
│   ├── layout.tsx                # Layout raiz
│   ├── not-found.tsx             # Página 404
│   └── page.tsx                  # Redirect para /dashboard
├── components/
│   └── layout/
│       ├── Sidebar.tsx           # Sidebar com navegação role-based
│       ├── Header.tsx            # Header com notificações
│       └── MobileNav.tsx         # Navegação mobile (bottom)
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Cliente browser
│   │   ├── server.ts             # Cliente servidor
│   │   └── middleware.ts         # Helper de autenticação
│   ├── constants.ts              # Labels e constantes
│   └── utils.ts                  # Utilitários (cn, formatadores)
├── types/
│   ├── database.ts               # Tipos do banco de dados
│   └── app.ts                    # Tipos da aplicação
├── proxy.ts                      # Proxy/Middleware Next.js 16
├── .env.local                    # Variáveis de ambiente
└── .env.example                  # Template de variáveis
```

---

## 🔒 Segurança

- **RLS ativa em todas as tabelas** — isolamento por empresa garantido pelo banco
- **Apenas anon key no frontend** — service role jamais exposta
- **Proxy/Middleware** — todas as rotas protegidas server-side
- **URLs assinadas** — arquivos do Storage nunca públicos
- **Validação Zod** — validação no cliente e servidor
- **Headers de segurança** — CSP, X-Frame-Options, etc.

---

## 🧪 Executar Testes

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build de produção
npm run build
```

---

## 📋 Perfis de Acesso

| Perfil | Acesso |
|---|---|
| `superadmin` | Plataforma inteira |
| `company_admin` | Toda a empresa |
| `project_manager` | Obras vinculadas — aprovação |
| `civil_responsible` | Setor Civil das obras vinculadas |
| `electrical_responsible` | Setor Elétrica das obras vinculadas |
| `mechanical_responsible` | Setor Mecânica das obras vinculadas |
| `viewer` | Visualização apenas |

---

## 🗺️ Roadmap

- [x] **Fase 2** — Base do projeto (autenticação, layout, banco de dados)
- [ ] **Fase 3** — Multiempresa e permissões completas
- [ ] **Fase 4** — CRUD de obras
- [ ] **Fase 5** — Relatório Diário (calendário + formulários)
- [ ] **Fase 6** — Anexos e ocorrências
- [ ] **Fase 7** — Fluxo de aprovação
- [ ] **Fase 8** — Dashboard e pesquisas
- [ ] **Fase 9** — Geração de PDF
- [ ] **Fase 10** — Testes e deploy

---

## 🚢 Deploy (Vercel)

```bash
npm run build
```

Configure as variáveis de ambiente no painel da Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

---

## ⚠️ Limitações Atuais (Fase 2)

- Sincronização offline não implementada (aguarda Fase futura)
- Notificações por e-mail não implementadas
- Assinatura digital ICP-Brasil não implementada
- Geração de PDF não implementada (Fase 9)
- Testes E2E pendentes (Fase 10)
