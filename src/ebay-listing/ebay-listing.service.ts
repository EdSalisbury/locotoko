import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { EbayService } from "../ebay/ebay.service";
import { CreateEbayListingDto } from "./dto";
import * as FormData from "form-data";

const fs = require("fs");

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
    // Get the item
    const item =
      await this.prisma.item.findUnique({
        where: {
          id: dto.itemId,
        },
      });

    // Throw if the owner doesn't exist
    if (!item) {
      throw new NotFoundException();
    }

    let imageUrls = [];
    // Upload the images
    for (const image of item.images) {
      const url = await this.uploadImage(image);
      imageUrls.push(url);
    }

    return this.ebay.trading.AddItem({
      Item: {
        Title: item.title,
        Description: item.description,
        Currency: this.config.get("CURRENCY"),
        Country: this.config.get("COUNTRY"),
        PrimaryCategory: {
          CategoryID: item.ebayCategoryId,
        },
        PostalCode: this.config.get(
          "POSTAL_CODE",
        ),
        Quantity: item.quantity,
        ButItNowPrice: {
          "#value": item.price.toString(),
          "@_currencyID": "USD",
        },
        StartPrice: {
          "#value": item.price.toString(),
          "@_currencyID": "USD",
        },
        PictureDetails: {
          PictureURL: imageUrls,
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
            "#value": item.shipSizeDepthInches,
          },
          PackageHeight: {
            "@_unit": "inches",
            "#value": item.shipSizeHeightInches,
          },
          PackageWidth: {
            "@_unit": "inches",
            "#value": item.shipSizeWidthInches,
          },
          WeightMajor: {
            "#value": item.shipWeightPounds,
            "@_unit": "lbs",
          },
          WeightMinor: {
            "#value": item.shipWeightOunces,
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

  async uploadImage(image: string) {
    // Strip off metadata
    var img = Buffer.from(
      image.split(",")[1],
      "base64",
    );

    const response =
      await this.ebay.trading.UploadSiteHostedPictures(
        { ExtensionInDays: 1 },
        {
          hook: (xml: string) => {
            const form = new FormData();
            form.append(
              "XML Payload",
              xml,
              "payload.xml",
            );
            form.append("dummy", img);
            return {
              body: form,
              headers: form.getHeaders(),
            };
          },
        },
      );
    return response.SiteHostedPictureDetails
      .FullURL;
  }
}
