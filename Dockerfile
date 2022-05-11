FROM node:17-alpine AS frontend

WORKDIR /build
ADD frontend .
RUN yarn
RUN yarn build

FROM node:17-alpine
WORKDIR /app

COPY backend/. .
RUN yarn

RUN yarn build
COPY --from=frontend /build/dist/ ./dist/client/

CMD ["yarn", "start:prod"]