# Guia de Migração - Backend + Supabase

Este documento complementa o plano de migração principal com instruções detalhadas para configuração do Prisma e setup inicial do backend.

## Configuração do Prisma com Supabase

### Passo 1: Criar arquivo .env do backend

O backend é um projeto Node separado com seu próprio `.env`, isolado do frontend. Isso é **crítico para segurança** - o backend contém credenciais sensíveis que nunca podem ir para o navegador.

Crie `backend/.env` manualmente com:

```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-do-painel

# Database (connection pooling, não a conexão direta - ver nota abaixo)
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[SENHA]@aws-0-[REGIAO].pooler.supabase.com:5432/postgres

# Servidor
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

Não há `JWT_SECRET`: o backend valida o token do Supabase Auth chamando
`supabaseAdmin.auth.getUser(token)` em vez de verificar um JWT próprio.

**Onde obter as credenciais:**
- `SUPABASE_URL`: Painel Supabase → Project Settings → API
- `SUPABASE_SERVICE_ROLE_KEY`: Painel Supabase → Project Settings → API (role: service_role)
- `DATABASE_URL`: Painel Supabase → Project Settings → Database → Connection Pooling → Connection string (modo "Session", porta 5432)

**⚠️ IMPORTANTE:**
- `SUPABASE_SERVICE_ROLE_KEY` é diferente da `ANON_KEY` do frontend
- `DATABASE_URL` contém senha direta do Postgres - nunca exposta ao navegador
- Use a Connection Pooling string, não `db.<projeto>.supabase.co:5432` - essa
  conexão direta só resolve em IPv6 e falha em qualquer rede/host IPv4-only
  (confirmado durante esta migração)
- O `.gitignore` já está configurado para bloquear arquivos `.env`

### Passo 2: Instalar dependências do backend

```bash
cd backend
npm install
```

### Passo 3: Pull do schema do Supabase

Este comando lê o schema atual do Postgres do Supabase e gera o arquivo `prisma/schema.prisma`:

```bash
npx prisma db pull
```

**Nota:** Se o comando falhar, verifique:
- `DATABASE_URL` está correta no `backend/.env`
- A senha no connection string está correta
- O IP está autorizado no painel do Supabase (Settings → Database → Allowed IPs)

### Passo 4: Gerar Prisma Client

```bash
npx prisma generate
```

Este comando gera o cliente tipado do Prisma baseado no schema.

### Passo 5: Testar o backend

```bash
npm run dev
```

O servidor deve iniciar em `http://localhost:3001` com:
- Health check: `GET /health`
- Swagger docs: `GET /docs`
- API endpoints: `GET /api/disciplinas`

## Troubleshooting

### Erro: "supabaseUrl is required"
- Causa: Arquivo `backend/.env` não existe ou não tem `SUPABASE_URL`
- Solução: Criar `backend/.env` com as variáveis listadas no Passo 1

### Erro: "prisma db pull" falha
- Causa: `DATABASE_URL` incorreta ou IP não autorizado
- Solução: Verificar connection string e autorizar IP no painel Supabase

### Erro: "Cannot find module '@prisma/client'"
- Causa: Prisma Client não foi gerado
- Solução: Executar `npx prisma generate`

### Erro de versão do Node
- Causa: Versão do Node incompatível com dependências
- Solução: Usar Node 18-20 (o projeto usa Prisma 5.22 que suporta Node 24)

## Segurança

**Variáveis sensíveis no backend (nunca expostas ao frontend):**
- `SUPABASE_SERVICE_ROLE_KEY` - acesso total ao Supabase
- `DATABASE_URL` - senha direta do Postgres
- `JWT_SECRET` - chave para assinar tokens

**Variáveis no frontend (seguras para o navegador):**
- `VITE_SUPABASE_URL` - URL pública do Supabase
- `VITE_SUPABASE_ANON_KEY` - chave anônima (acesso limitado via RLS)

## Próximos Passos

Após configurar o Prisma e testar o backend:
1. Validar que o endpoint `/health` funciona
2. Testar o módulo de Disciplina (prova de conceito)
3. Migrar os demais módulos de domínio conforme o plano principal
