FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# for development — runs Vite dev server (default when building without --target)
FROM node:24-alpine AS dev
WORKDIR /app
COPY --from=build /app .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# for production -  minimal image with just the built static files
FROM alpine:3.23 AS prod
COPY --from=build /app/dist /dist
CMD ["cp", "-r", "/dist/.", "/output"]