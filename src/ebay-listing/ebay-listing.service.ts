import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { EbayService } from "../ebay/ebay.service";
import { CreateEbayListingDto } from "./dto";
@Injectable()
export class EbayListingService {
  constructor(
    private prisma: PrismaService,
    private ebay: EbayService,
    private config: ConfigService,
  ) {}

  async createEbayListing(
    dto: CreateEbayListingDto,
  ) {
    return this.ebay.trading.AddItem({
      Item: {
        Title: "Test Item",
        Description: "This is a test item",
        Currency: this.config.get("CURRENCY"),
        Country: this.config.get("COUNTRY"),
        PrimaryCategory: {
          CategoryID: 29223,
        },
        PostalCode: this.config.get(
          "POSTAL_CODE",
        ),
        ButItNowPrice: {
          "#value": 74.99,
          "@_currencyID": "USD",
        },
        StartPrice: {
          "#value": 74.99,
          "@_currencyID": "USD",
        },
        PictureDetails: {
          PictureURL: [
            "https://i.ebayimg.com/00/s/MTM2MVgxMDM4/z/uzoAAOSw4GlifUei/$_12.JPG?set_id=880000500F",
          ],
        },
        ListingDuration: "GTC",
        ListingType: "FixedPriceItem",
        SellerProfiles: {
          SellerPaymentProfile: {
            PaymentProfileID: this.config.get(
              "EBAY_PAYMENT_POLICY_ID",
            ),
          },
          SellerReturnProfile: {
            ReturnProfileID: this.config.get(
              "EBAY_RETURN_POLICY_ID",
            ),
          },
          SellerShippingProfile: {
            ShippingProfileID: this.config.get(
              "EBAY_SHIPPING_POLICY_ID",
            ),
          },
        },
        ShippingPackageDetails: {
          ShippingIrregular: false,
          ShippingPackage: "PackageThickEnvelope",
          PackageDepth: {
            "@_unit": "inches",
            "#value": 5,
          },
          PackageHeight: {
            "@_unit": "inches",
            "#value": 5,
          },
          PackageWidth: {
            "@_unit": "inches",
            "#value": 5,
          },
          WeightMajor: {
            "#value": 1,
            "@_unit": "lbs",
          },
          WeightMinor: {
            "#value": 0,
            "@_unit": "oz",
          },
        },
      },
    });
  }

  async getEbayListing(itemId: string) {
    return this.ebay.trading.GetItem({
      ItemID: itemId,
    });
  }
}
