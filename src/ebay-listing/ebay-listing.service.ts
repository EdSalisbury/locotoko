import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { EbayService } from "../ebay/ebay.service";
import { CreateEbayListingDto, UpdateEbayListingDto } from "./dto";
import FormData from "form-data";
import {
  encodeSpecialCharsInObject,
  decodeSpecialCharsInObject,
} from "../util";

@Injectable()
export class EbayListingService {

  private readonly logger = new Logger();

  constructor(
    private prisma: PrismaService,
    private ebay: EbayService,
    private config: ConfigService,
  ) { }

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

    //this.ebay.OAuth2.setCredentials(this.config.get("EBAY_AUTH_TOKEN"));

    try {
      let imageUrls = [];
      // Upload the images
      for (const image of item.images) {
        if (image !== "") {
          const url = await this.uploadImage(image);
          imageUrls.push(url);
        }
      }

      let shippingPolicy = this.config.get("EBAY_SHIPPING_POLICY_ID");

      let request = {
        Item: {
          Title: item.title + "-" + item.id.slice(-4),
          SKU: item.location,
          ConditionID: item.ebayConditionId,
          Description: {
            __cdata: item.description.replaceAll("\n", "<br />\n"),
          },
          Currency: this.config.get("CURRENCY"),
          Country: this.config.get("COUNTRY"),
          ItemSpecifics: this.getSpecificArray(item.specifics),
          PrimaryCategory: {
            CategoryID: item.ebayCategoryId,
          },
          PostalCode: this.config.get("POSTAL_CODE"),
          Quantity: item.quantity,
          StartPrice: {
            "#value":
              parseFloat(item.price.toString()) +
              parseFloat(item.shippingPrice.toString()),
            "@_currencyID": "USD",
          },
          PictureDetails: {
            PictureURL: imageUrls,
          },
          ListingDuration: "GTC",
          ProductListingDetails: {
            UPC: item.upc,
            ISBN: item.upc,
          },
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

      request = encodeSpecialCharsInObject(request);
      const response = await this.ebay.trading.AddItem(request);
      const ebayListingId = response.ItemID;

      // // Create ebay listing
      // await this.prisma.ebayListing.create({
      //   data: {
      //     id: ebayListingId.toString(),
      //     itemId: item.id,
      //   },
      // });

      // Update item with eBay listing ID
      item.ebayListingId = ebayListingId.toString();
      item.listedAt = new Date();

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
      console.log(JSON.stringify(e.meta));
      throw new BadRequestException(e.meta.Errors);
    }
  }

  async updateEbayListing(end: Boolean, dto: UpdateEbayListingDto) {
    // Get the item
    this.logger.warn('This is a warning message');
    const item = await this.prisma.item.findUnique({
      where: {
        id: dto.itemId,
      },
    });

    // Throw if the owner doesn't exist
    if (!item) {
      throw new NotFoundException();
    }

    if (end) {
      return await this.ebay.trading.EndFixedPriceItem({
        itemID: item.ebayListingId,
        endingReason: "NotAvailable",
      });
    }

    try {
      let imageUrls = [];
      // Upload the images
      for (const image of item.images) {
        const url = await this.uploadImage(image);
        imageUrls.push(url);
      }

      let shippingPolicy = this.config.get("EBAY_SHIPPING_POLICY_ID");

      let request = {
        Item: {
          ItemID: item.ebayListingId,
          Title: item.title + "-" + item.id.slice(-4),
          SKU: item.location,
          ConditionID: item.ebayConditionId,
          ItemSpecifics: this.getSpecificArray(item.specifics),
          Description: {
            __cdata: item.description.replaceAll("\n", "<br />\n"),
          },
          Currency: this.config.get("CURRENCY"),
          Country: this.config.get("COUNTRY"),
          PrimaryCategory: {
            CategoryID: item.ebayCategoryId,
          },
          PostalCode: this.config.get("POSTAL_CODE"),
          Quantity: item.quantity - item.quantitySold,
          StartPrice: {
            "#value":
              parseFloat(item.price.toString()) +
              parseFloat(item.shippingPrice.toString()),
            "@_currencyID": "USD",
          },
          PictureDetails: {
            PictureURL: imageUrls,
          },
          ListingDuration: "GTC",
          ProductListingDetails: {
            UPC: item.upc,
            ISBN: item.upc,
          },
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
      request = encodeSpecialCharsInObject(request);
      return await this.ebay.trading.ReviseItem(request);
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.meta.Errors);
    }
  }

  async getEbayListing(itemId: string) {
    const item = await this.ebay.trading.GetItem({
      ItemID: itemId,
      IncludeItemSpecifics: true,
    });
    return decodeSpecialCharsInObject(item);
  }

  async getEbayListings() {
    let listings = [];

    let pageNum = 1;
    let maxPages = 2;

    while (pageNum <= maxPages) {
      const result = await this.ebay.trading.GetMyeBaySelling({
        ActiveList: {
          Sort: "TimeLeft",
          Pagination: {
            EntriesPerPage: 200,
            PageNumber: pageNum,
          },
        },
      });

      listings.push(...result.ActiveList.ItemArray.Item);

      maxPages = result.ActiveList.PaginationResult.TotalNumberOfPages;
      pageNum++;
    }
    return listings;
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
    let specObj = JSON.parse(specifics);
    if (!Array.isArray(specObj)) {
      let arr = [];
      for (const key of Object.keys(specObj)) {
        let obj = {};
        obj["key"] = key;
        obj["value"] = specObj[key];
        arr.push(obj);
      }
      specObj = arr;
    }

    const data = specObj.map((specific) => ({
      Name: specific.key,
      Value: specific.value,
    }));

    return {
      NameValueList: data,
    };
  }
}
