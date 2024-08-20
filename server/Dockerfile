FROM node
WORKDIR /app
COPY . .
COPY package.json .
RUN npm install
EXPOSE 8000

CMD ["sh", "-c", "node init.js && npm run start"]