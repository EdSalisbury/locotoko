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

  private async getTmdbDetails(title: string, year?: string) {
    const apiKey = this.config.get<string>("TMDB_API_KEY");
    if (!apiKey || !title) {
      return null;
    }
    const params = new URLSearchParams({
      api_key: apiKey,
      query: title,
      include_adult: "false",
      language: "en-US",
      ...(year ? { year } : {}),
    });
    const url = `https://api.themoviedb.org/3/search/movie?${params.toString()}`;
    const response = await axios.get(url);
    if (!response.data?.results?.length) {
      return null;
    }
    const movie = response.data.results[0];
    const detailUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&language=en-US`;
    const detailResponse = await axios.get(detailUrl);
    return detailResponse.data;
  }

  async getMusicProduct(upc: string) {
    const url = "https://musicbrainz.org/ws/2/release/?query=barcode:" + upc;
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Locotoko/1.0 (contact@locotoko.com)",
      },
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

    //const token = await this.ebay.OAuth2.getApplicationAccessToken();
    //this.ebay.OAuth2.setCredentials(token);
    const product = await this.ebay.finding.findItemsByProduct(request);
    // this.ebay.OAuth2.setCredentials(this.config.get("EBAY_AUTH_TOKEN"));

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

    //const token = await this.ebay.OAuth2.getApplicationAccessToken();
    //this.ebay.OAuth2.setCredentials(token);
    const product = await this.ebay.shopping.FindProducts(request);
    //this.ebay.OAuth2.setCredentials(this.config.get("EBAY_AUTH_TOKEN"));

    return decodeSpecialCharsInObject(product);
  }

  async getProduct(upc: string) {
    let details = {};
    details["UPC"] = upc;
    details["EAN"] = upc;

    let musicProduct: any = null;
    try {
      musicProduct = await this.getMusicProduct(upc);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.warn("MusicBrainz lookup failed", message);
    }

    try {
      if (musicProduct?.releases?.length > 0) {
        const release = musicProduct.releases[0];
        details["Release Title"] = release.title;
        details["Artist"] = release["artist-credit"][0].name;
        details["Format"] = release.media[0].format;
        details["Record Label"] = release["label-info"][0].label.name;
        details["Release Year"] = release.date.split("-")[0];
      }
    } catch {}

    try {
      const ebayProduct = await this.getEbayProduct(upc);
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

      const tmdb = await this.getTmdbDetails(
        details["Release Title"] || details["Title"],
        details["Release Year"],
      );
      if (tmdb) {
        details["Overview"] = tmdb.overview;
        if (tmdb.runtime) {
          details["Runtime (Minutes)"] = tmdb.runtime;
        }
        if (tmdb.release_date) {
          details["Release Date"] = tmdb.release_date;
          details["Release Year"] =
            details["Release Year"] ||
            tmdb.release_date.split("-")[0];
        }
        if (Array.isArray(tmdb.genres) && tmdb.genres.length) {
          details["Genres"] = tmdb.genres.map((g) => g.name).join(", ");
        }
        if (tmdb.original_language) {
          details["Language"] = tmdb.original_language;
        }
      }
    } catch {}

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
    } catch {}

    return details;
  }
}
