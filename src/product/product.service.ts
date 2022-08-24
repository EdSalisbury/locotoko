import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class ProductService {
  async getProduct(upc: string) {
    const url = "https://musicbrainz.org/ws/2/release/?query=barcode:" + upc;
    const response = await axios.get(url, {
      headers: { Accept: "application/json" },
    });
    return JSON.stringify(response.data);
  }
}
