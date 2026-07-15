import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  ZodTypeProvider
} from 'fastify-type-provider-zod';
import { errorHandler } from './middlewares/error.middleware';
import { authMiddleware } from './middlewares/auth.middleware';
import { config } from './config';

const fastify = Fastify({
  logger: true
}).withTypeProvider<ZodTypeProvider>();

// Faz o Fastify validar/serializar `schema.body` etc. usando os schemas Zod
// dos módulos diretamente (sem precisar converter para JSON Schema à mão).
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

// Headers de segurança (X-Content-Type-Options, X-Frame-Options, HSTS etc).
// CSP desligado de propósito: essa API não serve HTML pro usuário final (só
// o Swagger UI em /docs, que já fica restrito a dev + autenticado abaixo) -
// o CSP de página é responsabilidade do frontend (Vercel), não deste backend.
fastify.register(helmet, {
  contentSecurityPolicy: false
});

// Rate limit global - protege contra brute-force/abuso já que não existe
// nenhuma outra barreira desse tipo nas rotas (login em si é direto no
// Supabase Auth, que tem seu próprio rate limit; isso aqui cobre as rotas
// deste backend).
fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

// Registrar CORS
fastify.register(cors, {
  origin: config.cors.origin,
  credentials: config.cors.credentials
});

// Swagger/Swagger UI só existem fora de produção - em produção o plugin
// nem é registrado, então /docs simplesmente não existe (404).
if (!config.isProduction) {
  fastify.register(swagger, {
    transform: jsonSchemaTransform,
    openapi: {
      info: {
        title: 'Project Management API',
        version: '1.0.0',
        description: 'Backend API for Project Management System'
      },
      servers: [
        {
          url: `http://localhost:${config.port}`,
          description: 'Development server'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    }
  });

  fastify.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    // Exige um token válido (mesma checagem das rotas /api) pra ver a
    // documentação - antes disso, /docs respondia 200 pra qualquer um.
    uiHooks: {
      onRequest: authMiddleware
    }
  });
}

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
});

// Error handler global
fastify.setErrorHandler(errorHandler);

// Rotas
import { disciplinasRoutes } from './modules/disciplinas/disciplinas.routes';
import { usuariosRoutes } from './modules/usuarios/usuarios.routes';
import { comercialRoutes } from './modules/comercial/comercial.routes';
import { controleOSRoutes } from './modules/controleos/controleos.routes';
import { empreendimentoRoutes } from './modules/empreendimento/empreendimento.routes';
import { documentoRoutes } from './modules/documento/documento.routes';
import { equipeRoutes } from './modules/equipe/equipe.routes';
import { pavimentoRoutes } from './modules/pavimento/pavimento.routes';
import { sobraUsuarioRoutes } from './modules/sobrausuario/sobrausuario.routes';
import { planejamentoAtividadeRoutes } from './modules/planejamentoatividade/planejamentoatividade.routes';
import { planejamentoDocumentoRoutes } from './modules/planejamentodocumento/planejamentodocumento.routes';
import { genericRoutes } from './modules/generic/generic.routes';
import { analiticoRoutes } from './modules/analitico/analitico.routes';
fastify.register(disciplinasRoutes, { prefix: '/api' });
fastify.register(usuariosRoutes, { prefix: '/api' });
fastify.register(comercialRoutes, { prefix: '/api' });
fastify.register(controleOSRoutes, { prefix: '/api' });
fastify.register(empreendimentoRoutes, { prefix: '/api' });
fastify.register(documentoRoutes, { prefix: '/api' });
fastify.register(equipeRoutes, { prefix: '/api' });
fastify.register(pavimentoRoutes, { prefix: '/api' });
fastify.register(sobraUsuarioRoutes, { prefix: '/api' });
fastify.register(planejamentoAtividadeRoutes, { prefix: '/api' });
fastify.register(planejamentoDocumentoRoutes, { prefix: '/api' });
fastify.register(genericRoutes, { prefix: '/api' });
fastify.register(analiticoRoutes, { prefix: '/api' });

export default fastify;
