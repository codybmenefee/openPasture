# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage - use Caddy to serve static files
FROM caddy:2-alpine
COPY --from=builder /app/dist /srv
COPY <<EOF /etc/caddy/Caddyfile
:8080 {
    root * /srv
    encode gzip
    file_server
    try_files {path} /index.html
}
EOF
EXPOSE 8080
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
