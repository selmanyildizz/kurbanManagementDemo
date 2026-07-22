FROM node:20-alpine AS build
WORKDIR /build
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
ARG VITE_API_BASE=/api
ENV VITE_API_BASE=$VITE_API_BASE
RUN npm run build

FROM caddy:2-alpine
COPY --from=build /build/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
