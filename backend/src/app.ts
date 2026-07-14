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
fastify.register(disciplinasRoutes, { prefix: '/api' });

export default fastify;
