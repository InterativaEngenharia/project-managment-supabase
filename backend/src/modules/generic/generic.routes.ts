import { FastifyInstance } from 'fastify';
import { registerGenericCrudRoutes } from '../../shared/genericCrudModule';
import {
  alteracaoEtapaSchema,
  ataReuniaoSchema,
  atividadeSchema,
  atividadeFuncaoSchema,
  atividadeGenericaSchema,
  atividadesEmpreendimentoSchema,
  checklistItemSchema,
  checklistPlanejamentoSchema,
  dataCadastroSchema,
  execucaoSchema,
  itemPreSchema,
  notificacaoAtividadeSchema,
  osManualSchema
} from './schemas';

// Entidades sem regra de RLS customizada no Base44 original e sem trava de
// perfil na tela que as usa hoje - CRUD aberto a qualquer autenticado (ver
// backend/PERMISSOES.md). Cada uma é só um par (rota HTTP, tabela Prisma) -
// ver shared/genericCrudModule.ts pra lógica compartilhada.
export async function genericRoutes(fastify: FastifyInstance) {
  registerGenericCrudRoutes(fastify, {
    path: 'alteracoes-etapa',
    prismaModel: 'alteracaoEtapa',
    createSchema: alteracaoEtapaSchema
  });
  registerGenericCrudRoutes(fastify, {
    path: 'atas-reuniao',
    prismaModel: 'ataReuniao',
    createSchema: ataReuniaoSchema,
    orderBy: { data: 'desc' }
  });
  registerGenericCrudRoutes(fastify, {
    path: 'atividades',
    prismaModel: 'atividade',
    createSchema: atividadeSchema
  });
  registerGenericCrudRoutes(fastify, {
    path: 'atividades-funcao',
    prismaModel: 'atividadeFuncao',
    createSchema: atividadeFuncaoSchema
  });
  registerGenericCrudRoutes(fastify, {
    path: 'atividades-genericas',
    prismaModel: 'atividadeGenerica',
    createSchema: atividadeGenericaSchema,
    orderBy: { nome: 'asc' }
  });
  registerGenericCrudRoutes(fastify, {
    path: 'atividades-empreendimento',
    prismaModel: 'atividadesEmpreendimento',
    createSchema: atividadesEmpreendimentoSchema
  });
  registerGenericCrudRoutes(fastify, {
    path: 'checklist-itens',
    prismaModel: 'checklistItem',
    createSchema: checklistItemSchema
  });
  registerGenericCrudRoutes(fastify, {
    path: 'checklist-planejamentos',
    prismaModel: 'checklistPlanejamento',
    createSchema: checklistPlanejamentoSchema
  });
  registerGenericCrudRoutes(fastify, {
    path: 'datas-cadastro',
    prismaModel: 'dataCadastro',
    createSchema: dataCadastroSchema
  });
  registerGenericCrudRoutes(fastify, {
    path: 'execucoes',
    prismaModel: 'execucao',
    createSchema: execucaoSchema
  });
  registerGenericCrudRoutes(fastify, {
    path: 'itens-pre',
    prismaModel: 'itemPRE',
    createSchema: itemPreSchema
  });
  registerGenericCrudRoutes(fastify, {
    path: 'notificacoes-atividade',
    prismaModel: 'notificacaoAtividade',
    createSchema: notificacaoAtividadeSchema
  });
  registerGenericCrudRoutes(fastify, {
    path: 'os-manuais',
    prismaModel: 'oSManual',
    createSchema: osManualSchema
  });
}
