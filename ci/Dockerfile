FROM node:lts-alpine AS builder
WORKDIR /app

RUN apk add --no-cache alpine-sdk python3 make g++

# Copy package files
COPY package.json yarn.lock ./
COPY prisma ./prisma/

# Install dependencies using yarn
RUN yarn install --frozen-lockfile

# Copy source files including potential .env
COPY . .

# Generate Prisma client
RUN yarn prisma:generate

# Build the application
RUN yarn build

FROM node:lts-alpine AS main

WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/prisma ./prisma

# Copy and set permissions for entrypoint
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]