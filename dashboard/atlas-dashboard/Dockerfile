FROM node:22-slim
WORKDIR /app
RUN apt-get update && apt-get install -y openssl git && rm -rf /var/lib/apt/lists/*
RUN npm i -g openclaw
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
