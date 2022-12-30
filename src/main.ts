import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { urlencoded, json } from "express";
import { ExpressAdapter } from "@nestjs/platform-express";
import * as http from "http";
import * as https from "https";
import * as express from "express";

async function bootstrap() {
  const fs = require("fs");
  //const keyFile = fs.readFileSync(__dirname + "/../server.key");
  // const certFile = fs.readFileSync(__dirname + "/../server.csr");
  // const httpsOptions = {
  //   key: keyFile,
  //   cert: certFile,
  // };
  // const server = express();

  // const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
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
  //http.createServer(server).listen(3000);
  //https.createServer(httpsOptions, server).listen(443);
  await app.listen(3333, "0.0.0.0");
}
bootstrap();
