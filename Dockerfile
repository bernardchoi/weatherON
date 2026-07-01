FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/package.json
RUN npm ci --omit=dev --workspace @weatheron/server

COPY apps/server apps/server

ENV NODE_ENV=production
ENV WEATHER_SERVER_HOST=0.0.0.0

CMD ["npm", "--workspace", "@weatheron/server", "start"]
