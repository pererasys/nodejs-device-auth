# Build stage: create a clean TS->JS build

FROM node:14 AS build

RUN mkdir -p /build
WORKDIR /build

COPY package.json .

COPY yarn.lock .

RUN yarn install

COPY . .

RUN yarn build


# Build the final slimmed application image

FROM node:14

RUN mkdir -p /app

WORKDIR /app

COPY package.json .

COPY yarn.lock .

RUN yarn install --production

COPY --from=build /build/dist .

CMD ["node", "server.js"]