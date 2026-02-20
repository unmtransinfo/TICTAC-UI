FROM node:24-alpine
ARG ASSET_ROOT='\/tictac'
ENV ASSET_ROOT=$ASSET_ROOT
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 8080

CMD ["npm", "run", "dev"]