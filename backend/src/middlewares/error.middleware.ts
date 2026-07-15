import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

export async function errorHandler(
  error: FastifyError | ZodError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  console.error('Erro na requisição:', error);

  // Erro de validação do Zod (schema.body/params via fastify-type-provider-zod
  // devolve o ZodError bruto, não o formato error.validation do Fastify)
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'Erro de validação',
      details: error.issues
    });
  }

  // Erro de validação nativo do Fastify (schemas JSON Schema "puros")
  if ('validation' in error && error.validation) {
    return reply.status(400).send({
      error: 'Erro de validação',
      details: error.validation
    });
  }

  // Erro de autenticação/autorização
  if (error.statusCode === 401 || error.statusCode === 403) {
    return reply.status(error.statusCode).send({
      error: error.message || 'Erro de autorização'
    });
  }

  // Outros erros de requisição malformada que o próprio Fastify já
  // classifica como 4xx antes de chegar aqui (ex: JSON inválido no corpo,
  // FST_ERR_CTP_INVALID_JSON_BODY) - sem isso, caíam todos no 500 genérico
  // abaixo, escondendo um erro de cliente como se fosse erro do servidor.
  if (typeof error.statusCode === 'number' && error.statusCode >= 400 && error.statusCode < 500) {
    return reply.status(error.statusCode).send({
      error: error.message || 'Requisição inválida'
    });
  }

  // Erro genérico
  return reply.status(500).send({
    error: 'Erro interno do servidor'
  });
}
