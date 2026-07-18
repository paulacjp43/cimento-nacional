# GESTOBRA — Sistema de Relatório Diário de Obras

Sistema digital para elaboração, armazenamento, consulta e emissão de Relatórios Diários de Obra (RDO), com suporte multiempresa, múltiplos setores (Civil, Elétrica, Mecânica e Segurança do Trabalho) e fluxo de aprovação completo.

---

## 🌟 Funcionalidades Principais

- **Setores Independentes:** Gestão de RDOs com separação de responsabilidades entre Civil, Elétrica, Mecânica e Segurança do Trabalho.
- **Status Independente por Setor:** Cada setor preenche sua parte do RDO e envia para aprovação independentemente, com controle de status (Rascunho, Em Análise, Aprovado, Devolvido).
- **RDO Consolidado:** O sistema agrupa automaticamente os dados preenchidos pelos responsáveis de cada setor em um único Relatório Diário da Obra.
- **PDF Consolidado:** Geração de documento PDF unificado contendo as informações consolidadas de todos os setores.
- **Fluxo de Aprovação:** Gestão de ciclo de vida do relatório (Preenchimento → Revisão Técnica → Aprovação Final do Gestor/Admin).
- **Upload de Documentos:** Armazenamento de PDFs, plantas e arquivos anexos vinculados aos projetos.

---

## 🚀 Instalação e Configuração

### 1. Pré-requisitos
- Node.js 18+
- npm 9+
- Conta no Supabase (Autenticação, Banco de Dados, Storage)

### 2. Clonar e Instalar Dependências
```bash
git clone <url-do-repositorio> gestobra
cd gestobra
npm install
```

### 3. Variáveis de Ambiente
Crie na raiz do projeto um arquivo ignorado pelo versionamento (ex: `.env.local` - **nunca comite este arquivo!**) e defina as seguintes chaves de acordo com seu painel do Supabase e domínio da aplicação:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

> ⚠️ **ATENÇÃO:** Nunca insira senhas reais, `SUPABASE_SERVICE_ROLE_KEY` ou outras credenciais sensíveis no código-fonte, nos arquivos versionados ou nesta documentação.

### 4. Configurar o Banco de Dados (Migrations)
O banco de dados utiliza a estrutura gerenciada pelas migrations do Supabase.

Para criar as tabelas locais (ou aplicar em um novo projeto), use a CLI do Supabase:
```bash
supabase migration up
```
Ou aplique os arquivos de `supabase/migrations/` ordenadamente no SQL Editor do Supabase.

> 🚨 **AVISO DE SEGURANÇA EM PRODUÇÃO:** Não execute scripts SQL destrutivos ou migrations de reestruturação diretamente no banco de dados de produção sem antes realizar um backup completo (`pg_dump` ou Point-in-Time Recovery). 

### 5. Executar Localmente
Para iniciar o servidor de desenvolvimento:
```bash
npm run dev
```
Acesse: `http://localhost:3000`

---

## 👥 Contas de Acesso

Para fins de segurança e conformidade, não fornecemos contas genéricas com senhas pré-configuradas no código.

Recomendamos que durante o desenvolvimento você crie suas próprias contas diretamente pelo painel do Supabase, utilizando e-mails fictícios (ex: `admin@example.com`, `gestor@example.com`) e definindo senhas seguras. Após a criação, você pode atribuir os perfis de acesso diretamente na tabela `profiles`.

---

## 📁 Estrutura de Pastas (Atualizada)

```
gestobra/
├── app/                          # Next.js App Router (Páginas e API)
│   ├── (auth)/                   # Fluxos de login e recuperação de senha
│   ├── (dashboard)/              # Painel da obra, relatórios e equipe
│   └── ...                       # Layouts, páginas de erro (404, 403)
├── components/                   # Componentes React
│   ├── layout/                   # Sidebars, Headers e Menus
│   ├── rdo/                      # Lógica e abas do RDO e Setores
│   └── ui/                       # Botões, inputs, modais
├── lib/                          # Lógica de integração e regras de negócio
│   └── supabase/                 # Clientes do Supabase (Server, Client, Middleware)
├── supabase/                     # Configurações do banco de dados
│   └── migrations/               # Histórico de arquivos SQL de estruturação
├── types/                        # Definições globais TypeScript
└── ...                           # Configurações raiz (Tailwind, ESLint, Next)
```

---

## 🔒 Segurança

- **RLS (Row Level Security):** Ativa em tabelas. Restrições *Cross-Tenant* para isolar dados por empresa, e isolamento de acessos no *Storage*.
- **Apenas anon key no frontend** — A chave `service_role` jamais deve ser exposta ao lado cliente.
- **Proxy/Middleware** — Validação rigorosa de tokens server-side protegendo todas as rotas de dashboard.
- **URLs Assinadas:** Links temporários gerados para os documentos e anexos do projeto (Storage privado).

---

## 🧪 Qualidade de Código e Build

Recomenda-se executar os seguintes comandos antes de criar um Pull Request ou fazer o Deploy de produção:

```bash
# Validação de Tipagem (TypeScript Check)
npx tsc --noEmit

# Analisador Estático (Linter)
npm run lint

# Simular a compilação do Next.js
npm run build
```

---

## 📋 Perfis de Acesso

| Perfil | Acesso Permitido |
|---|---|
| `superadmin` | Gestão completa da plataforma (todas as empresas). |
| `company_admin` | Gestão completa dentro da sua empresa. |
| `project_manager` | Visualização e aprovação final de RDOs nas obras vinculadas. |
| `civil_responsible` | Edição e submissão da aba "Civil" nas obras vinculadas. |
| `electrical_responsible` | Edição e submissão da aba "Elétrica" nas obras vinculadas. |
| `mechanical_responsible` | Edição e submissão da aba "Mecânica" nas obras vinculadas. |
| `safety_responsible` | Edição e submissão da aba "Segurança do Trabalho". |
| `viewer` | Apenas visualização de relatórios. |

---

## 🚢 Deploy Recomendado (Vercel)

```bash
npm run build
```

Certifique-se de configurar as variáveis de ambiente necessárias diretamente no painel de configuração da Vercel para o seu projeto, em **Settings > Environment Variables**. Nunca insira as variáveis na UI como texto simples em repositórios públicos.
