FROM node:18-alpine AS builder
WORKDIR /app

# Copy shared package
COPY ../packages/shared/package.json ../packages/shared/
COPY ../packages/shared/tsconfig.json ../packages/shared/
COPY ../packages/shared/src ../packages/shared/src

# Install backend dependencies
COPY package*.json ./
RUN npm ci

# Build backend
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
# Copy only runtime artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 3001
CMD ["npm", "start"]
