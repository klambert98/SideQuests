FROM node:18-alpine AS builder
WORKDIR /app

# Copy and build shared package at the expected location
COPY packages/shared/package.json /packages/shared/
COPY packages/shared/tsconfig.json /packages/shared/
COPY packages/shared/src /packages/shared/src
WORKDIR /packages/shared
RUN npm install && npm run build

# Install backend dependencies
WORKDIR /app
# Install build tools required by native modules like sharp
RUN apk add --no-cache python3 make g++ vips-dev
COPY backend/package*.json ./
RUN npm install --production=false

# Build backend
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
# Copy only runtime artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /packages/shared /packages/shared
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 3001
CMD ["npm", "start"]
