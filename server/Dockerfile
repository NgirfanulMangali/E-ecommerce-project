FROM node:22

WORKDIR /app

COPY package*.json ./
COPY prisma.config.ts ./
COPY src/prisma ./src/prisma

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]