# FROM node

# WORKDIR /app
# COPY . .
# COPY package.json .

# RUN npm install



# EXPOSE 3000

# CMD [ "npm", "start" ]


# Build stage
FROM node:latest as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

# Serve stage
FROM node:latest
WORKDIR /app
COPY --from=build /app/build /app
RUN npm install -g serve
CMD ["serve", "-s", ".", "-l", "3000"]
EXPOSE 3000