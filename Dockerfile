FROM node:17-alpine AS client

WORKDIR /build
ADD client .
RUN yarn
RUN yarn build

FROM node:17-alpine
WORKDIR /app

COPY . .

WORKDIR /app/ebay
RUN yarn

WORKDIR /app
RUN yarn

RUN yarn build
COPY --from=client /build/dist/ ./dist/client/

CMD ["yarn", "start:prod"]