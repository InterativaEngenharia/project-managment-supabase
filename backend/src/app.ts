import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  ZodTypeProvider
} from 'fastify-type-provider-zod';
import { errorHandler } from './middlewares/error.middleware';
import { config } from './config';

const fastify = Fastify({
  logger: true
}).withTypeProvider<ZodTypeProvider>();

// Faz o Fastify validar/serializar `schema.body` etc. usando os schemas Zod
// dos módulos diretamente (sem precisar converter para JSON Schema à mão).
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

// Registrar CORS
fastify.register(cors, {
  origin: config.cors.origin,
  credentials: config.cors.credentials
});

// Registrar Swagger
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
  }
});

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
fastify.register(disciplinasRoutes, { prefix: '/api' });
fastify.register(usuariosRoutes, { prefix: '/api' });
fastify.register(comercialRoutes, { prefix: '/api' });
fastify.register(controleOSRoutes, { prefix: '/api' });
fastify.register(empreendimentoRoutes, { prefix: '/api' });
fastify.register(documentoRoutes, { prefix: '/api' });
fastify.register(equipeRoutes, { prefix: '/api' });
fastify.register(pavimentoRoutes, { prefix: '/api' });
fastify.register(sobraUsuarioRoutes, { prefix: '/api' });

export default fastify;
