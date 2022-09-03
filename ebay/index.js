import { default as axios } from "axios";
import "dotenv/config";
import { nextTick } from "process";

let TOKEN;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const getHeaders = () => {
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    },
  };
};

const apiUrl = (resource, id = "", action = "") => {
  return (
    process.env.VUE_APP_API_BASE_URL +
    `/api/v1/${resource}` +
    (id ? `/${id}` : "") +
    (action ? `/${action}` : "")
  );
};

const login = async () => {
  const url = process.env.VUE_APP_API_BASE_URL + "/api/v1/auth/login";
  const request = {
    email: process.env.EBAY_EMAIL,
    password: process.env.EBAY_PASSWORD,
  };
  const response = await axios.post(url, request, getHeaders());
  TOKEN = response.data.access_token;
};

const getItems = async () => {
  const url = process.env.VUE_APP_API_BASE_URL + "/api/v1/items";
  const response = await axios.get(url, getHeaders());
  return response.data;
};

const getSoldItems = async () => {
  const url = process.env.VUE_APP_API_BASE_URL + "/api/v1/items?sold";
  const response = await axios.get(url, getHeaders());
  return response.data;
};

const getItem = async (itemId) => {
  const url = process.env.VUE_APP_API_BASE_URL + "/api/v1/items/" + itemId;
  const response = await axios.get(url, getHeaders());
  return response.data;
};

const getItemByEbayItemId = async (ebayItemId) => {
  const items = await getItems();
  return items.filter((item) => item.ebayListingId == ebayItemId)[0];
};

const updateItemSold = async (itemId, quantitySold, endTime, soldPrice) => {
  try {
    const item = await getItem(itemId);
    const url = process.env.VUE_APP_API_BASE_URL + "/api/v1/items/" + itemId;
    const request = {
      soldPrice: parseFloat(soldPrice),
      quantitySold: item.quantitySold + quantitySold,
      soldAt: endTime,
    };
    const response = await axios.patch(url, request, getHeaders());
    if (response.status === 200) {
      console.log("Marked item " + item.title + " as sold successfully.");
    } else {
      console.error(
        "Unable to mark item " + item.title + " as sold:\n" + response.data,
      );
    }
  } catch (e) {
    console.error(
      "Unable to update item " +
        itemId +
        ":\n" +
        JSON.stringify(e.response.data),
    );
  }
};

const getSellerEvents = async () => {
  const url = process.env.VUE_APP_API_BASE_URL + "/api/v1/ebaySellerEvents";
  const response = await axios.get(url, getHeaders());
  return response.data;
};

const processSales = async () => {
  console.log("Processing sales... ");
  await login();
  const events = await getSellerEvents();
  const ebayItems = events.ItemArray.Item;
  for (const ebayItem of ebayItems) {
    const item = await getItemByEbayItemId(ebayItem.ItemID);
    if (!item) {
      console.error(
        "Unable to find item with eBay Listing ID: " + ebayItem.ItemID,
      );
    } else {
      if (item.soldAt !== ebayItem.ListingDetails.EndTime) {
        await updateItemSold(
          item.id,
          ebayItem.SellingStatus.QuantitySold,
          ebayItem.ListingDetails.EndTime,
          ebayItem.SellingStatus.CurrentPrice.value,
        );
      }
    }
  }
};

const processPayouts = async () => {
  await login();
  const startDate = new Date(
    date.getFullYear(),
    date.getMonth() - 1,
    1,
  ).toISOString();
  const endDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
  ).toISOString();

  const soldItems = await getItems((sold = true)).filter((item) => {
    item.soldAt >= startDate && item.soldAt <= endDate;
  });

  soldItems.forEach((item) => {
    // TODO: Process sold items
  });
};

const getWeeksDiff = (startDate, endDate) => {
  const msInWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(Math.abs(endDate - startDate) / msInWeek);
};

const updateItem = async (id, request) => {
  const url = apiUrl("items", id);
  try {
    const response = await axios.patch(url, request, getHeaders());
    console.log(`Updated item ${id} successfully.`);
    return response;
  } catch (e) {
    console.error(
      `Unable to update item ${id}:\n${JSON.stringify(e.response.data)}`,
    );
    return e.response;
  }
};

const updateEbayListing = async (id) => {
  const url = apiUrl("ebayListings", id);
  const request = {
    itemId: id,
  };

  try {
    const response = await axios.patch(url, request, getHeaders());
    console.log(`Updated eBay item for ${id} successfully.`);
    return response;
  } catch (e) {
    console.error(
      `Unable to update item ${id}:\n${JSON.stringify(e.response.data)}`,
    );
    return e.response;
  }
};

const markdownItems = async () => {
  console.log("Marking down items... ");
  await login();
  const markdownRate = 0.005;
  const now = new Date();
  const items = await getSoldItems();
  for (const item of items) {
    const weeks = getWeeksDiff(new Date(item.createdAt), now);
    const currentPrice = (item.price * (1 - markdownRate * weeks)).toFixed(2);
    if (currentPrice.toString() !== item.price.toString()) {
      console.log(
        `Updating ${item.id} price to ${currentPrice} (Originally ${item.price})`,
      );
      const itemResponse = await updateItem(item.id, {
        currentPrice: parseFloat(currentPrice),
      });
      if (itemResponse.status !== 200) {
        continue;
      }
      await updateEbayListing(item.id);
    }
  }
};

const main = async () => {
  while (true) {
    await processSales();
    await markdownItems();
    await sleep(1000 * 60);
  }
};

main();
