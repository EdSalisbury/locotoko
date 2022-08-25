import { Injectable } from "@nestjs/common";
import axios from "axios";
import { EbayService } from "../ebay/ebay.service";
import { ConfigService } from "@nestjs/config";
const eBay = require("ebay-node-api");

@Injectable()
export class ProductService {
  constructor(private ebay: EbayService, private config: ConfigService) {}

  async getMusicProduct(upc: string) {
    const url = "https://musicbrainz.org/ws/2/release/?query=barcode:" + upc;
    const response = await axios.get(url, {
      headers: { Accept: "application/json" },
    });
    return response.data;
  }

  async getEbayProduct(upc: string) {
    let ebay = new eBay({
      clientID: this.config.get("EBAY_APP_ID"),
      clientSecret: this.config.get("EBAY_CERT_ID"),
    });
    const token = await ebay.getAccessToken();
    const request = {
      ProductID: {
        "#value": upc,
        "@_type": "UPC",
      },
    };
    this.ebay.OAuth2.setCredentials(token.access_token);
    const product = await this.ebay.shopping.FindProducts(request);
    let productStr = JSON.stringify(product);
    productStr = productStr.replaceAll("&apos;", "'");
    productStr = productStr.replaceAll("&quot;", '"');
    productStr = productStr.replaceAll("&amp;", "&");
    productStr = productStr.replaceAll("&lt;", "<");
    productStr = productStr.replaceAll("&gt;", ">");
    return JSON.parse(productStr);
  }

  async getProduct(upc: string) {
    const ebayProduct = await this.getEbayProduct(upc);
    const musicProduct = await this.getMusicProduct(upc);

    let details = {};
    details["UPC"] = upc;
    details["EAN"] = upc;

    if (musicProduct.releases.length > 0) {
      const release = musicProduct.releases[0];
      details["Release Title"] = release.title;
      details["Artist"] = release["artist-credit"][0].name;
      details["Format"] = release.media[0].format;
      details["Record Label"] = release["label-info"][0].label.name;
      details["Release Year"] = release.date.split("-")[0];
      return details;
    }
    ebayProduct.Product.ItemSpecifics.NameValueList.forEach((specific) => {
      details[specific.Name] = specific.Value;
    });
    details["Title"] = ebayProduct.Product.Title;
    const title = ebayProduct.Product.Title;
    const regex = /^(.*?)\s+\((.*?), (.*?)\)$/;
    const found = title.match(regex);
    if (found) {
      details["Release Title"] = details["Release Title"] || found[1];
      details["Release Year"] = details["Release Year"] || found[3];
    }

    return details;
  }
}
