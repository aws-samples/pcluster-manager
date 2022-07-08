# Install dependencies
FROM node:16-alpine as deps
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm ci

# Build source code
FROM node:16-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Disable telemetry
#   Next.js collects completely anonymous telemetry data about general usage.
#   Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run export
