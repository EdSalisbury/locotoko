import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { ItemModule } from "./item/item.module";
import { OwnerModule } from "./owner/owner.module";
import { EbayModule } from "./ebay/ebay.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    PrismaModule,
    ItemModule,
    OwnerModule,
    EbayModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "client"),
    }),
  ],
})
export class AppModule {}
