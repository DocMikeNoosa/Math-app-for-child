# Radiopis — production image. Normally started with deploy/docker-compose.yml (app + HTTPS proxy), see DEPLOY.md.
# Alone: docker build -t radiopis . && docker run -d -p 3000:3000 -v radiopis-data:/data --env-file .env radiopis
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim
# UV_THREADPOOL_SIZE: password hashing runs in this pool — 8 keeps a morning login rush of 200 people fast
ENV NODE_ENV=production DATA_DIR=/data HOST=0.0.0.0 PORT=3000 UV_THREADPOOL_SIZE=8
WORKDIR /app
# only what the server needs: no tests, no tools, no un-built browser sources besides the modules the server imports
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/server.js ./
COPY --from=build /app/lib ./lib
COPY --from=build /app/scripts/backup.mjs ./scripts/backup.mjs
COPY --from=build /app/dist ./dist
COPY --from=build /app/public/js ./public/js
COPY --from=build /app/public/fonts ./public/fonts
COPY --from=build /app/public/icons ./public/icons
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME ["/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "--disable-warning=ExperimentalWarning", "server.js"]
