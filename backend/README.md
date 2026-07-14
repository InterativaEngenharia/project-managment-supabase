# Project Management Backend

Backend API para o sistema de gestão de projetos. Arquitetura de 3 camadas: Frontend → Backend → Supabase.

## Stack

- **Node.js + TypeScript**
- **Fastify** (framework HTTP)
- **Supabase** (Auth + Database + Storage)
- **Zod** (validação de schema)
- **Swagger** (documentação de API)

## Estrutura de Pastas

```
backend/
├── src/
│   ├── config/           # Configurações (Supabase, Prisma, variáveis de ambiente)
│   ├── middlewares/      # Auth, autorização, error handling
│   ├── modules/          # Módulos de domínio (disciplinas, empreendimentos, etc.)
│   │   └── disciplinas/
│   │       ├── disciplinas.routes.ts
│   │       ├── disciplinas.controller.ts
│   │       ├── disciplinas.service.ts
│   │       └── disciplinas.schema.ts
│   ├── app.ts            # Configuração do Fastify
│   └── server.ts         # Entry point
├── prisma/
│   └── schema.prisma     # Schema do banco (a ser criado)
├── package.json
├── tsconfig.json
└── .env                  # Variáveis de ambiente (não versionado)
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do backend com as seguintes variáveis:

```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Database
DATABASE_URL=postgresql://postgres:[password]@db.seu-projeto.supabase.co:5432/postgres

# Servidor
PORT=3001
CORS_ORIGIN=http://localhost:5173

```

Não há `JWT_SECRET` porque o backend não emite nem verifica JWT próprio — ele
valida o token do Supabase Auth chamando `supabaseAdmin.auth.getUser(token)`,
que delega a verificação (assinatura, expiração, rotação de chave) ao próprio
Supabase em vez de reimplementar isso aqui.

**IMPORTANTE:**
- `SUPABASE_SERVICE_ROLE_KEY` é a chave de serviço do Supabase (nunca exposta ao frontend)
- `DATABASE_URL` é a connection string do Postgres do Supabase (obtida no painel)
- Nunca commitar o arquivo `.env`

## Instalação

```bash
cd backend
npm install
```

## Configurar Prisma

Opção 1: Pull do schema existente do Supabase
```bash
npx prisma db pull
npx prisma generate
```

Opção 2: Criar schema manualmente em `prisma/schema.prisma` e aplicar migrations
```bash
npx prisma migrate dev
npx prisma generate
```

## Executar

Desenvolvimento:
```bash
npm run dev
```

Produção:
```bash
npm run build
npm start
```

## Endpoints

### Health Check
- `GET /health` - Verifica se o servidor está rodando

### Disciplinas (Prova de Conceito)
- `GET /api/disciplinas` - Listar todas (autenticado)
- `GET /api/disciplinas/:id` - Obter por ID (autenticado)
- `POST /api/disciplinas` - Criar (requer permissão de gestão/coordenador/líder/direção ou admin)
- `PATCH /api/disciplinas/:id` - Atualizar (requer permissão de gestão/coordenador/líder/direção ou admin)
- `DELETE /api/disciplinas/:id` - Deletar (requer permissão de gestão/coordenador/líder/direção ou admin)

### Documentação
- `GET /docs` - Swagger UI (documentação interativa da API)

## Autenticação

O backend usa o JWT emitido pelo Supabase Auth. O frontend deve enviar o token no header:

```
Authorization: Bearer <token-do-supabase>
```

O middleware de autenticação:
1. Valida o token com o Supabase
2. Busca o perfil do usuário na tabela `Usuario`
3. Popula `req.user` com os dados do usuário

## Autorização

O middleware de autorização verifica permissões baseado em perfil/role:

- **Admin**: Acesso total a tudo
- **Outros perfis**: Verifica permissões específicas por rota

Baseado nas regras de `routePermissions.js` do frontend.

## Próximos Passos

1. Instalar dependências: `npm install`
2. Configurar variáveis de ambiente no `.env`
3. Configurar Prisma com o Supabase
4. Testar o endpoint `/health`
5. Testar o módulo de disciplinas
6. Migrar os demais módulos de domínio (Empreendimento, PlanejamentoAtividade, etc.)

## Notas

- O módulo de Disciplina é a referência de padrão para os próximos módulos: `routes` (Fastify + schema Zod) → `controller` → `service` (Prisma) → `schema` (Zod).
- Acesso a tabela é sempre via Prisma (`prisma.<model>.*`). `supabaseAdmin` (cliente Supabase com service role) fica reservado para o que Prisma não cobre: validar o token de auth e Storage.
- Se `npx prisma db pull`/`prisma migrate` falhar com erro de rede ao tentar `db.<projeto>.supabase.co:5432`, é porque esse host só resolve em IPv6 hoje - troque `DATABASE_URL` pela Connection Pooling string do painel (Project Settings → Database → Connection Pooling), que é IPv4.
- Realtime (subscribe) será substituído por polling no MVP (10-15s)
