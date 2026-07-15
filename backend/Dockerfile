FROM node:22-slim AS builder
WORKDIR /app

# Prisma engines linkam contra libssl - node:20-slim (Debian) não vem com
# isso por padrão, sem isso `prisma generate`/o client falham em runtime.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-slim AS runtime
WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --user-group --create-home --shell /bin/false appuser

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

ENV NODE_ENV=production
USER appuser

EXPOSE 3001
CMD ["node", "dist/server.js"]
