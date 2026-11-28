import { Module, OnApplicationBootstrap } from "@nestjs/common";
import { AnthropicModule } from "../anthropic/anthropic.module";
import { AnthropicService } from "../anthropic/anthropic.service";
import { PrismaService } from "../prisma/prisma.service";
import { EbayCategoryService } from "../ebay-category/ebay-category.service";
import { EbayConditionService } from "../ebay-condition/ebay-condition.service";
import { EbaySpecificsService } from "../ebay-specifics/ebay-specifics.service";
import { DraftController } from "./draft.controller";
import { DraftService } from "./draft.service";
import { IdentifyService } from "./identify.service";

// DraftService and IdentifyService are plain classes (unit tested without
// NestJS), so they're built here.
@Module({
  imports: [AnthropicModule],
  providers: [
    EbayCategoryService,
    EbayConditionService,
    EbaySpecificsService,
    {
      provide: IdentifyService,
      useFactory: (anthropic: AnthropicService) => new IdentifyService(anthropic),
      inject: [AnthropicService],
    },
    {
      provide: DraftService,
      useFactory: (
        prisma: PrismaService,
        anthropic: AnthropicService,
        identifier: IdentifyService,
        categories: EbayCategoryService,
        conditions: EbayConditionService,
        specifics: EbaySpecificsService,
      ) => new DraftService(prisma, anthropic, identifier, categories, conditions, specifics),
      inject: [
        PrismaService,
        AnthropicService,
        IdentifyService,
        EbayCategoryService,
        EbayConditionService,
        EbaySpecificsService,
      ],
    },
  ],
  controllers: [DraftController],
})
export class DraftModule implements OnApplicationBootstrap {
  constructor(private drafts: DraftService) {}

  onApplicationBootstrap() {
    return this.drafts.resumeUnfinished();
  }
}
