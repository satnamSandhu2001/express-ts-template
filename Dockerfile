FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app

RUN groupadd -g 1001 nodejs \
    && useradd -m -u 1001 -g nodejs nodejs

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

COPY --chown=nodejs:nodejs .env* ./

USER nodejs

EXPOSE 5500

CMD ["node", "dist/index.js"]
