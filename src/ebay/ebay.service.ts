import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import ebayApi from "ebay-api";

@Injectable()
export class EbayService {
  ebay: ebayApi;

  constructor(config: ConfigService) {
    this.ebay = ebayApi.fromEnv();
  }
}
