FROM node:24-bookworm-slim AS deps

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

FROM node:24-bookworm-slim AS builder

WORKDIR /app

ARG DATABASE_URL=postgresql://postgres:password@localhost:5432/restaurant_db?schema=public
ENV DATABASE_URL=$DATABASE_URL

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate
RUN npm run build

FROM node:24-bookworm-slim AS runner

WORKDIR /app

ARG DATABASE_URL=postgresql://postgres:password@localhost:5432/restaurant_db?schema=public
ENV DOCKER_HOST=0.0.0.0
ENV PORT=4000
ENV DATABASE_URL=$DATABASE_URL

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci && npx prisma generate && npm cache clean --force

COPY --from=builder /app/dist ./dist
RUN mkdir -p uploads

ENV NODE_ENV=production

EXPOSE 4000

CMD ["npm", "run", "start"]
