import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { urlencoded, json } from "express";

async function bootstrap() {
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
  await app.listen(3333, "0.0.0.0");
}
bootstrap();
