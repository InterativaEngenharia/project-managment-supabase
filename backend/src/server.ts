import fastify from './app';
import { config } from './config';

const start = async () => {
  try {
    await fastify.listen({ 
      port: config.port,
      host: '0.0.0.0'
    });

    console.log(`🚀 Server running on http://localhost:${config.port}`);
    console.log(`📚 Documentation available at http://localhost:${config.port}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
