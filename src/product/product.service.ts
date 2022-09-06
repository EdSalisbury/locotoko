import { Injectable } from "@nestjs/common";
import axios from "axios";
import { EbayService } from "../ebay/ebay.service";
import { ConfigService } from "@nestjs/config";
import { decodeSpecialCharsInObject } from "../util";
import { EbayListingService } from "../ebay-listing/ebay-listing.service";

@Injectable()
export class ProductService {
  constructor(
    private ebay: EbayService,
    private ebayListing: EbayListingService,
    private config: ConfigService,
  ) {}

  async getMusicProduct(upc: string) {
    const url = "https://musicbrainz.org/ws/2/release/?query=barcode:" + upc;
    const response = await axios.get(url, {
      headers: { Accept: "application/json" },
    });
    return response.data;
  }

  async getEbayItemsByProduct(upc: string) {
    const request = {
      productId: {
        "#value": upc,
        "@_type": "UPC",
      },
      paginationInput: {
        entriesPerPage: 5,
      },
    };

    const token = await this.ebay.OAuth2.getApplicationAccessToken();
    this.ebay.OAuth2.setCredentials(token);
    const product = await this.ebay.finding.findItemsByProduct(request);
    this.ebay.OAuth2.setCredentials(this.config.get("EBAY_AUTH_TOKEN"));

    const decodedProduct = decodeSpecialCharsInObject(product);
    return decodedProduct.searchResult.item;
  }

  async getEbayProduct(upc: string) {
    const request = {
      ProductID: {
        "#value": upc,
        "@_type": "UPC",
      },
    };

    const token = await this.ebay.OAuth2.getApplicationAccessToken();
    this.ebay.OAuth2.setCredentials(token);
    const product = await this.ebay.shopping.FindProducts(request);
    this.ebay.OAuth2.setCredentials(this.config.get("EBAY_AUTH_TOKEN"));

    return decodeSpecialCharsInObject(product);
  }

  async getProduct(upc: string) {
    let details = {};
    details["UPC"] = upc;
    details["EAN"] = upc;

    // const musicProduct = await this.getMusicProduct(upc);

    // if (musicProduct.releases.length > 0) {
    //   const release = musicProduct.releases[0];
    //   details["Release Title"] = release.title;
    //   details["Artist"] = release["artist-credit"][0].name;
    //   details["Format"] = release.media[0].format;
    //   details["Record Label"] = release["label-info"][0].label.name;
    //   details["Release Year"] = release.date.split("-")[0];
    //   //return details;
    // }

    // try {
    //   const ebayProduct = await this.getEbayProduct(upc);
    //   ebayProduct.Product.ItemSpecifics.NameValueList.forEach((specific) => {
    //     details[specific.Name] = specific.Value;
    //   });
    //   details["Title"] = ebayProduct.Product.Title;
    //   const title = ebayProduct.Product.Title;
    //   const regex = /^(.*?)\s+\((.*?), (.*?)\)$/;
    //   const found = title.match(regex);
    //   if (found) {
    //     details["Release Title"] = details["Release Title"] || found[1];
    //     details["Release Year"] = details["Release Year"] || found[3];
    //   }
    // } catch (e) {
    //   console.log(e);
    //   return {};
    // }

    try {
      const items = await this.getEbayItemsByProduct(upc);
      for (const item of items) {
        const itemDetails = await this.ebayListing.getEbayListing(item.itemId);
        if (
          itemDetails &&
          itemDetails.Item &&
          itemDetails.Item.ItemSpecifics &&
          itemDetails.Item.ItemSpecifics.NameValueList
        ) {
          for (const nameValue of itemDetails.Item.ItemSpecifics
            .NameValueList) {
            if (!details.hasOwnProperty(nameValue.Name)) {
              details[nameValue.Name] = nameValue.Value;
            }
          }
        }
      }
    } catch (e) {
      console.log(e);
      return {};
    }

    return details;
  }
}
