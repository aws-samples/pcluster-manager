FROM node:16-alpine
WORKDIR /app
COPY . .
# The env var is used to skip git-secrets checks, not needed for the build
ENV CI true
RUN npm ci
# Disable telemetry
#   Next.js collects completely anonymous telemetry data about general usage.
#   Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run export
