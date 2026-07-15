# Matriz de permissões original (Base44)

Referência para migrar cada módulo ao backend. Extraída dos schemas `.jsonc`
das entidades e do código do frontend antes da migração - é a fonte de
verdade para quem pode ler/escrever cada entidade, use isto em vez de
adivinhar a partir do código do backend (o PoC inicial de `disciplinas`
errou essa regra por copiar um padrão genérico - ver correção no commit que
adicionou este arquivo).

## Hierarquia de perfis

Definida em `src/components/contexts/ActivityTimerContext.jsx`
(`PERFIS_HIERARQUIA`) e espelhada em `backend/src/shared/perfis.ts`:

| Perfil | Nível | 
|---|---|
| admin | acesso total, bypassa tudo |
| direcao | 6 |
| gestao | 5 |
| lider | 4 |
| coordenador | 3 |
| apoio | 2 |
| consultor | 1 |
| user | 1 |

`hasPermission(nivelMinimo)` = `isAdmin || nivelUsuario >= nivelMinimo`. Mas
várias regras abaixo **não** seguem essa hierarquia numérica (ex: Disciplina
só libera lider, não gestao/direcao mesmo sendo "maiores"), por isso o
backend tem dois helpers (`requirePerfilMinimo` e `requirePerfilExato`, ver
`authorize.middleware.ts`) - use o exato sempre que a regra da tabela abaixo
não for um corte limpo de hierarquia.

## Navegação (menu lateral / rotas do frontend)

Ver `src/utils/routePermissions.js` e `src/Layout.jsx` - já implementado
como guard de rota (ver commit de correção do `Layout.jsx`).

| Item | Perfis com acesso |
|---|---|
| Dashboard, Empreendimentos | Todos |
| Comercial | gestao, direcao, admin |
| Planejamento, Controle OS (SeletorPlanejamento/ControleOSGlobal) | coordenador, gestao, lider, direcao, admin |
| Relatórios | coordenador+, consultor, admin |
| ATA de Reunião | coordenador+, consultor, apoio, admin |
| Atividades Rápidas | todos exceto consultor |
| Usuários, Configurações | lider, direcao, admin |

## Leitura/escrita por entidade

R = leitura, W = escrita (create/update/delete).

| Entidade | Read | Write | Status da migração |
|---|---|---|---|
| Disciplina | Todos | admin + lider | ✅ migrado (backend/src/modules/disciplinas) |
| Usuario | Todos | admin + lider + direcao | ✅ migrado (backend/src/modules/usuarios) |
| Empreendimento | Todos | criador + admin + lider + coordenador + gestao + direcao | ✅ migrado (backend/src/modules/empreendimento) |
| Comercial | Todos | admin + lider + direcao + gestao | ✅ migrado (backend/src/modules/comercial) |
| ControleOS | Todos | admin + lider + coordenador + gestao + direcao | ✅ migrado (backend/src/modules/controleos) - sem regra customizada no Base44 original, decisão do usuário foi usar o mesmo limiar do Empreendimento (coordenador+, sem cláusula de dono) |
| Documento | Todos | admin + lider + coordenador + gestao + direcao | ✅ migrado (backend/src/modules/documento) - mesma decisão acima |
| Equipe | Todos | admin + lider + direcao | ✅ migrado (backend/src/modules/equipe) - não é corte de hierarquia limpo, gestao fica de fora de propósito |
| Pavimento | Todos (decisão do usuário) | criador + admin + lider+ | ✅ migrado (backend/src/modules/pavimento) - jsonc original usava chave "role" (não "perfil") pra leitura, que não corresponde a nenhuma coluna real; tratado como leitura aberta |
| SobraUsuario | Todos (decisão do usuário) | Todos (decisão do usuário) | ✅ migrado (backend/src/modules/sobrausuario) - jsonc dizia "admin apenas" pros dois, mas a feature real (aba Sobras em Planejamento) não tem nenhuma trava de perfil hoje; restringir quebraria o uso atual, então ficou aberto |
| PlanejamentoAtividade | executor próprio + admin/lider/coordenador/gestao/direcao | mesmo que leitura (exceto array `executores`, delete não considera) | ✅ migrado (backend/src/modules/planejamentoatividade) - as policies `has_role()` corretas já existiam no banco antes desta migração, só as permissivas antigas foram removidas |
| PlanejamentoDocumento | Todos | executor próprio + admin/lider/coordenador/gestao/direcao | ✅ migrado (backend/src/modules/planejamentodocumento) - policies criadas do zero espelhando PlanejamentoAtividade |
| ChecklistItem, Atividade, Execucao, ItemPRE, AtaReuniao, e demais sem RLS customizada listada | - | - | padrão da plataforma original: criador lê/edita os próprios registros, admin tem acesso total - revalidar regra exata ao migrar cada uma |

### Nota sobre discrepâncias encontradas entre o jsonc e o banco (Fase 2)

Ao migrar Comercial e Empreendimento, as policies `has_role()` que já existiam
no Supabase (criadas antes desta migração, provavelmente numa tentativa
anterior de replicar as regras do Base44) estavam incompletas:
- `Comercial`: faltava `lider` na lista de perfis que podem escrever.
- `Empreendimento`: faltava a cláusula "ou é quem criou o registro" no
  insert/update, e faltava `coordenador` na policy de delete (só insert/update
  tinham).

O usuário confirmou seguir o jsonc original nos dois casos - as policies
foram recriadas corretamente. Ao migrar os módulos restantes, sempre
comparar a policy viva no banco (`select * from pg_policies where
tablename = '...'`) contra o `.jsonc` original (recuperável via
`git show <commit-antes-da-remoção>:base44/entities/<Nome>.jsonc`) antes de
confiar em qualquer um dos dois isoladamente.

### Regra granular de PlanejamentoAtividade / PlanejamentoDocumento

| Operação | Quem pode |
|---|---|
| Criar | é o `executor_principal` (email) OU criador do registro OU admin/lider/coordenador/gestao/direcao |
| Ler | é o `executor_principal` OU está no array `executores[]` OU admin/lider/coordenador/gestao/direcao |
| Atualizar | mesma regra de Ler |
| Deletar | criador do registro OU `executor_principal` OU admin/lider/coordenador/gestao/direcao |

### Funções (Edge Functions / equivalentes)

| Função | Permissão |
|---|---|
| getMediasPlanejamentos | qualquer autenticado |
| testEmailNotificacao (Base44) / send-email (Supabase Edge Function atual) | era admin-only no Base44 (`user.role === 'admin'`) - a function atual em `supabase/functions/send-email` hoje aceita qualquer autenticado (usada pelo NotificationGenerator para o próprio usuário); revisar se isso é intencional antes de migrar |
