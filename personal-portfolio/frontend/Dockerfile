FROM node:18-alpine as base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build application
FROM base as builder
COPY . .
RUN npm run build

# Production image
FROM base
COPY --from=builder /app/.next ./.next
COPY public ./public
COPY package*.json ./

EXPOSE 3000

CMD ["npm", "start"]
