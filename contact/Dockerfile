# syntax=docker/dockerfile:1

FROM node:22-slim AS build
ARG ENVIRONMENT_BUILD=prod
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:${ENVIRONMENT_BUILD}

FROM nginx:1.27-alpine
WORKDIR /app
COPY --from=build /app/.dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
