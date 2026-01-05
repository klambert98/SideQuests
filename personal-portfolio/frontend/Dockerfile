FROM node:18-alpine as base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build application
FROM base as builder
ARG NEXT_PUBLIC_API_URL=https://side-quest-api.fly.dev/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
COPY . .
RUN npm run build

# Production image
FROM base
COPY --from=builder /app/.next ./.next
COPY public ./public
COPY package*.json ./

EXPOSE 3000

CMD ["npm", "start"]
