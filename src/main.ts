import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { urlencoded, json } from "express";
import { ExpressAdapter } from "@nestjs/platform-express";
import * as http from "http";
import * as https from "https";
import express from "express";

async function bootstrap() {
  if (process.env.USE_SSL === "true") {
    const fs = require("fs");
    const keyFile = fs.readFileSync(
      "/etc/locotoko/store.bluedragontrading.ltd.key",
    );
    const certFile = fs.readFileSync(
      "/etc/locotoko/store.bluedragontrading.ltd.crt",
    );
    const caFile = fs.readFileSync(
      "/etc/locotoko/store.bluedragontrading.ltd.ca",
    );
    const httpsOptions = {
      key: keyFile,
      cert: certFile,
      ca: caFile,
    };
    const server = express();

    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    app.enableCors();
    app.use(json({ limit: "500mb" }));
    app.setGlobalPrefix("api/v1");
    app.use(
      urlencoded({
        extended: true,
        limit: "500mb",
      }),
    );
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    https.createServer(httpsOptions, server).listen(3333);
  } else {
    const app = await NestFactory.create(AppModule);

    app.enableCors();
    app.use(json({ limit: "500mb" }));
    app.setGlobalPrefix("api/v1");
    app.use(
      urlencoded({
        extended: true,
        limit: "500mb",
      }),
    );
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    app.listen(3333);
  }
}
bootstrap();
