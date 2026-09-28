FROM node:22-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm@12.6.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/core/package.json ./packages/core/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

COPY packages/core/ ./packages/core/
COPY apps/web/ ./apps/web/

RUN pnpm --filter @quoridor/core run build
RUN pnpm --filter @quoridor/web run build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
