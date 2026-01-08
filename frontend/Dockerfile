FROM node:18-alpine as base

WORKDIR /app

# Copy and build shared package at the expected location
COPY packages/shared/package.json /packages/shared/
COPY packages/shared/tsconfig.json /packages/shared/
COPY packages/shared/src /packages/shared/src
WORKDIR /packages/shared
RUN npm install && npm run build

# Install dependencies
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install --production=false

# Build application
FROM base as builder
ARG NEXT_PUBLIC_API_URL=https://side-quest-api.fly.dev/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
COPY frontend/next.config.js ./
COPY frontend/tsconfig.json ./
COPY frontend/postcss.config.js ./
COPY frontend/tailwind.config.js ./
COPY frontend/public ./public
COPY frontend/src ./src
RUN npm run build

# Production image (slim)
FROM node:18-alpine as runner
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm prune --production

EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]
