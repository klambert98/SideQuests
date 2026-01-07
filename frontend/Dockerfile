FROM node:18-alpine as base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build application
FROM base as builder
ARG NEXT_PUBLIC_API_URL=https://side-quests-api.fly.dev/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
COPY . .
RUN npm run build

# Production image (slim)
FROM node:18-alpine as runner
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY public ./public
COPY package*.json ./
RUN npm prune --production

EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]
