import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { PrismaModule } from "./prisma/prisma.module";
import { PtouchModule } from "./ptouch/ptouch.module";
import { ConfigModule } from "@nestjs/config";
import { ItemModule } from "./item/item.module";
import { OwnerModule } from "./owner/owner.module";
import { EbayModule } from "./ebay/ebay.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { TemplateModule } from "./template/template.module";
import { EbayListingModule } from "./ebay-listing/ebay-listing.module";
import { EbayCategoryModule } from "./ebay-category/ebay-category.module";
import { EbayConditionModule } from "./ebay-condition/ebay-condition.module";
import { EbaySellerEventModule } from "./ebay-seller-event/ebay-seller-event.module";
import { ProductModule } from "./product/product.module";
import { AcquisitionModule } from "./acquisition/acquisition.module";
import { PayoutModule } from "./payout/payout.module";
import { EbayItemTransactionModule } from "./ebay-item-transaction/ebay-item-transaction.module";
import { EbayOrderModule } from "./ebay-order/ebay-order.module";
import { PickModule } from './pick/pick.module';
import { EbayMarkdownModule } from './ebay-markdown/ebay-markdown.module';
import { MetricModule } from './metric/metric.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    PrismaModule,
    PtouchModule,
    ItemModule,
    OwnerModule,
    EbayModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "client"),
    }),
    TemplateModule,
    EbayListingModule,
    EbayCategoryModule,
    EbayConditionModule,
    EbaySellerEventModule,
    ProductModule,
    AcquisitionModule,
    PayoutModule,
    EbayItemTransactionModule,
    EbayOrderModule,
    PickModule,
    EbayMarkdownModule,
    MetricModule,
    InventoryModule,
  ],
})
export class AppModule {}
