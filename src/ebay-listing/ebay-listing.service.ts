import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { EbayService } from "../ebay/ebay.service";
import { CreateEbayListingDto, UpdateEbayListingDto } from "./dto";
import * as FormData from "form-data";
@Injectable()
export class EbayListingService {
  constructor(
    private prisma: PrismaService,
    private ebay: EbayService,
    private config: ConfigService,
  ) {}

  async createEbayListing(dto: CreateEbayListingDto) {
    // Get the item
    const item = await this.prisma.item.findUnique({
      where: {
        id: dto.itemId,
      },
    });

    // Throw if the owner doesn't exist
    if (!item) {
      throw new NotFoundException();
    }

    try {
      let imageUrls = [];
      // Upload the images
      for (const image of item.images) {
        const url = await this.uploadImage(image);
        imageUrls.push(url);
      }

      let shippingPolicy = this.config.get(
        "EBAY_SHIPPING_FIRSTCLASS_POLICY_ID",
      );
      if (item.shipWeightPounds > 0) {
        shippingPolicy = this.config.get("EBAY_SHIPPING_PRIORITY_POLICY_ID");
      }
      if (item.shipWeightPounds > 10) {
        shippingPolicy = this.config.get("EBAY_SHIPPING_PARCEL_POLICY_ID");
      }

      let request = {
        Item: {
          Title: item.title + "-" + item.id.slice(-4),
          ConditionID: item.ebayConditionId,
          Description: item.description.replaceAll("\n", "&lt;br&gt;\n"),
          Currency: this.config.get("CURRENCY"),
          Country: this.config.get("COUNTRY"),
          ItemSpecifics: this.getSpecificArray(item.specifics),
          PrimaryCategory: {
            CategoryID: item.ebayCategoryId,
          },
          PostalCode: this.config.get("POSTAL_CODE"),
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
              PaymentProfileID: this.config.get("EBAY_PAYMENT_POLICY_ID"),
            },
            SellerReturnProfile: {
              ReturnProfileID: this.config.get("EBAY_RETURN_POLICY_ID"),
            },
            SellerShippingProfile: {
              ShippingProfileID: shippingPolicy,
            },
          },
          ShippingPackageDetails: {
            ShippingIrregular: false,
            ShippingPackage: "PackageThickEnvelope",
            PackageDepth: {
              "@_unit": "inches",
              "#value": item.shipSizeDepthInches,
            },
            PackageLength: {
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
      };

      //request = this.encodeSpecialChars(request);
      const response = await this.ebay.trading.AddItem(request);
      const ebayListingId = response.ItemID;

      // Create ebay listing
      await this.prisma.ebayListing.create({
        data: {
          id: ebayListingId.toString(),
          itemId: item.id,
        },
      });

      // Update item with eBay listing ID
      item.ebayListingId = ebayListingId.toString();

      return this.prisma.item.update({
        where: {
          id: item.id,
        },
        data: {
          ...item,
        },
      });
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.meta.Errors);
    }
  }

  async updateEbayListing(dto: UpdateEbayListingDto) {
    // Get the item
    const item = await this.prisma.item.findUnique({
      where: {
        id: dto.itemId,
      },
    });

    // Throw if the owner doesn't exist
    if (!item) {
      throw new NotFoundException();
    }

    try {
      let imageUrls = [];
      // Upload the images
      for (const image of item.images) {
        const url = await this.uploadImage(image);
        imageUrls.push(url);
      }

      let shippingPolicy = this.config.get(
        "EBAY_SHIPPING_FIRSTCLASS_POLICY_ID",
      );
      if (item.shipWeightPounds > 0) {
        shippingPolicy = this.config.get("EBAY_SHIPPING_PRIORITY_POLICY_ID");
      }
      if (item.shipWeightPounds > 10) {
        shippingPolicy = this.config.get("EBAY_SHIPPING_PARCEL_POLICY_ID");
      }

      let request = {
        Item: {
          ItemID: item.ebayListingId,
          Title: item.title + "-" + item.id.slice(-4),
          ConditionID: item.ebayConditionId,
          ItemSpecifics: this.getSpecificArray(item.specifics),
          Description: item.description.replaceAll("\n", "&lt;br&gt;\n"),
          Currency: this.config.get("CURRENCY"),
          Country: this.config.get("COUNTRY"),
          PrimaryCategory: {
            CategoryID: item.ebayCategoryId,
          },
          PostalCode: this.config.get("POSTAL_CODE"),
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
              PaymentProfileID: this.config.get("EBAY_PAYMENT_POLICY_ID"),
            },
            SellerReturnProfile: {
              ReturnProfileID: this.config.get("EBAY_RETURN_POLICY_ID"),
            },
            SellerShippingProfile: {
              ShippingProfileID: shippingPolicy,
            },
          },
          ShippingPackageDetails: {
            ShippingIrregular: false,
            ShippingPackage: "PackageThickEnvelope",
            PackageDepth: {
              "@_unit": "inches",
              "#value": item.shipSizeDepthInches,
            },
            PackageLength: {
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
      };
      //request = this.encodeSpecialChars(request);
      return await this.ebay.trading.ReviseItem(request);
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.meta.Errors);
    }
  }

  encodeSpecialChars(data: Object) {
    let strData = JSON.stringify(data);
    strData = strData.replaceAll("&", "&amp;");
    return JSON.parse(strData);
  }

  async getEbayListing(itemId: string) {
    return this.ebay.trading.GetItem({
      ItemID: itemId,
    });
  }

  async uploadImage(image: string) {
    // Strip off metadata
    var img = Buffer.from(image.split(",")[1], "base64");

    const response = await this.ebay.trading.UploadSiteHostedPictures(
      { ExtensionInDays: 1 },
      {
        hook: (xml: string) => {
          const form = new FormData();
          form.append("XML Payload", xml, "payload.xml");
          form.append("dummy", img);
          return {
            body: form,
            headers: form.getHeaders(),
          };
        },
      },
    );
    return response.SiteHostedPictureDetails.FullURL;
  }

  getSpecificArray(specifics: string) {
    const specObj = JSON.parse(specifics);

    const data = specObj.map((specific) => ({
      Name: specific.key,
      Value: specific.value,
    }));

    return {
      NameValueList: data,
    };
  }
}
