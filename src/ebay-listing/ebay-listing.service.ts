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
import { buildEbaySku } from "./build-ebay-sku";
import { buildShippingPackageDetails } from "./build-shipping-package-details";
import { parseImageDataUrl } from "./parse-image-data-url";
import { buildProductListingDetails } from "./build-product-listing-details";
import {
  findShippingProblems,
  toClientErrors,
  ebayErrorToClientErrors,
} from "./listing-problems";

@Injectable()
export class EbayListingService {

  private readonly logger = new Logger();

  constructor(
    private prisma: PrismaService,
    private ebay: EbayService,
    private config: ConfigService,
  ) { }

  async createEbayListing(dto: CreateEbayListingDto) {
    // Get the item with acquisition for SKU generation
    const item = await this.prisma.item.findUnique({
      where: {
        id: dto.itemId,
      },
      include: {
        acquisition: true,
      },
    });

    // Throw if the owner doesn't exist
    if (!item) {
      throw new NotFoundException();
    }

    // Refuse before uploading anything, with a message the user can act on.
    const problems = findShippingProblems(item);
    if (problems.length > 0) {
      throw new BadRequestException(toClientErrors(problems));
    }

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
          SKU: buildEbaySku(item.location, item.acquisition?.name ?? null),
          ConditionID: item.ebayConditionId,
          ...(item.ebayConditionId === 4000 &&
            item.ebayCardConditionValueId && {
              ConditionDescriptors: {
                ConditionDescriptor: {
                  Name: "40001",
                  Value: item.ebayCardConditionValueId.toString(),
                },
              },
            }),
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
          ProductListingDetails: buildProductListingDetails(item.upc),
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
          ShippingPackageDetails: buildShippingPackageDetails(item),
        },
      };

      //request = encodeSpecialCharsInObject(request);
      console.log(request)
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
      return this.prisma.item.update({
        where: {
          id: item.id,
        },
        data: {
          ebayListingId: ebayListingId.toString(),
          listedAt: new Date(),
        },
      });
    } catch (e) {
      console.error(e);
      console.log(JSON.stringify(e.meta));
      throw new BadRequestException(ebayErrorToClientErrors(e));
    }
  }

  async updateEbayListing(end: Boolean, dto: UpdateEbayListingDto) {
    // Get the item with acquisition for SKU generation
    const item = await this.prisma.item.findUnique({
      where: {
        id: dto.itemId,
      },
      include: {
        acquisition: true,
      },
    });

    // Throw if the owner doesn't exist
    if (!item) {
      throw new NotFoundException();
    }

    if (end) {
      try {
        const response = await this.ebay.trading.EndFixedPriceItem({
          itemID: item.ebayListingId,
          endingReason: "NotAvailable",
        });
        this.logger.log(`trading.EndFixedPriceItem(${item.ebayListingId}) response: ${JSON.stringify(response)}`);
      } catch (e) {
        this.logger.warn(e);
      }
      return this.prisma.item.update({
        where: {
          id: dto.itemId,
        },
        data: {
          endedAt: new Date()
        },
      });
    }

    // Refuse before uploading anything, with a message the user can act on.
    const problems = findShippingProblems(item);
    if (problems.length > 0) {
      throw new BadRequestException(toClientErrors(problems));
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
          SKU: buildEbaySku(item.location, item.acquisition?.name ?? null),
          ConditionID: item.ebayConditionId,
          ...(item.ebayConditionId === 4000 &&
            item.ebayCardConditionValueId && {
              ConditionDescriptors: {
                ConditionDescriptor: {
                  Name: "40001",
                  Value: item.ebayCardConditionValueId.toString(),
                },
              },
            }),
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
          ProductListingDetails: buildProductListingDetails(item.upc),
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
          ShippingPackageDetails: buildShippingPackageDetails(item),
        },
      };
      return await this.ebay.trading.ReviseItem(request);
    } catch (e) {
      console.error(e);
      throw new BadRequestException(ebayErrorToClientErrors(e));
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

  // Uploads one stored photo to eBay Picture Services through the Media API
  // (createImageFromFile) and returns the EPS URL to put in the listing's
  // PictureURL. Replaces the Trading API's UploadSiteHostedPictures, which
  // eBay decommissions by 2026-10-26. Needs the sell.inventory OAuth scope.
  async uploadImage(image: string) {
    const { bytes, contentType, filename } = parseImageDataUrl(image);

    await this.ebay.OAuth2.refreshToken();

    const form = new FormData();
    form.append("image", bytes, { filename, contentType });

    const response = await this.ebay.commerce.media.createImageFromFile(form);
    if (!response?.imageUrl) {
      throw new Error("eBay accepted the photo upload but returned no image URL");
    }
    return response.imageUrl;
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
