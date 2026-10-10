FROM node:24-alpine AS client

WORKDIR /build
COPY .yarn .yarn
COPY .yarnrc.yml .yarnrc.yml
ADD client .
RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:24-alpine
WORKDIR /app

COPY . .

WORKDIR /app/ebay
RUN yarn install --frozen-lockfile

WORKDIR /app
RUN yarn install --frozen-lockfile

RUN yarn build:prod
COPY --from=client /build/dist/ ./dist/client/

CMD ["yarn", "start:prod"]