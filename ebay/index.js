import { ConsoleLogger } from "@nestjs/common";
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
    process.env.LOCAL_API_BASE_URL +
    `/api/v1/${resource}` +
    (id ? `/${id}` : "") +
    (action ? `/${action}` : "")
  );
};

const login = async () => {
  const url = process.env.LOCAL_API_BASE_URL + "/api/v1/auth/login";
  const request = {
    email: process.env.EBAY_EMAIL,
    password: process.env.EBAY_PASSWORD,
  };
  const response = await axios.post(url, request, getHeaders());
  TOKEN = response.data.access_token;
};

const createEbayListing = async (id) => {
  const url = process.env.LOCAL_API_BASE_URL + "/api/v1/ebayListings";
  const request = {
    itemId: id,
  };
  const response = await axios.post(url, request, getHeaders());
  return response.data;
};

const getItems = async () => {
  const url = process.env.LOCAL_API_BASE_URL + "/api/v1/items";
  const response = await axios.get(url, getHeaders());
  return response.data;
};

const getActiveItems = async () => {
  const url = process.env.LOCAL_API_BASE_URL + "/api/v1/items?sold=false";
  const response = await axios.get(url, getHeaders());
  return response.data;
};

const getSoldItems = async () => {
  const url = process.env.LOCAL_API_BASE_URL + "/api/v1/items?sold=true";
  const response = await axios.get(url, getHeaders());
  return response.data;
};

const getDraftItems = async () => {
  const url = process.env.LOCAL_API_BASE_URL + "/api/v1/items?draft=true";
  const response = await axios.get(url, getHeaders());
  return response.data;
};

const getItem = async (itemId) => {
  const url = process.env.LOCAL_API_BASE_URL + "/api/v1/items/" + itemId;
  const response = await axios.get(url, getHeaders());
  return response.data;
};

const getOwner = async (ownerId) => {
  const response = await axios.get(apiUrl("owners", ownerId), getHeaders());
  return response.data;
};

const getItemByEbayItemId = async (ebayItemId) => {
  const items = await getItems();
  const filtered = items.filter((item) => item.ebayListingId == ebayItemId);
  return filtered[0];
};

const updateItemSold = async (itemId, quantitySold, endTime, soldPrice) => {
  console.log(itemId, quantitySold, endTime, soldPrice);
  try {
    const item = await getItem(itemId);
    const url = process.env.LOCAL_API_BASE_URL + "/api/v1/items/" + itemId;
    const request = {
      soldPrice: soldPrice,
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
  const url = process.env.LOCAL_API_BASE_URL + "/api/v1/ebaySellerEvents";
  const response = await axios.get(url, getHeaders());
  return response.data;
};

const getEbayOrders = async () => {
  const response = await axios.get(apiUrl("ebayOrders"), getHeaders());
  return response.data;
};

const processNewSales = async () => {
  console.log("Processing sales... ");
  await login();
  const orders = await getEbayOrders();
  for (const order of orders) {
    for (const ebayItem of order.items) {
      const item = await getItemByEbayItemId(ebayItem.ebayItemId);
      if (!item) {
        console.error(
          `Unable to find item with eBay Listing ID: ${ebayItem.ItemID} (${ebayItem.Title})`,
        );
        continue;
      }
      if (item.soldAt !== order.paidTime) {
        console.log(`Marking ${item.title} as sold`);
        const request = {
          quantitySold: item.quantitySold + ebayItem.quantity,
          soldAt: order.paidTime,
        };
        await updateItem(item.id, request);
      }
    }
  }
  console.log("Done processing sales.");
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
        `Unable to find item with eBay Listing ID: ${ebayItem.ItemID} (${ebayItem.Title})`,
      );
    } else {
      if (item.quantitySold !== ebayItem.SellingStatus.QuantitySold) {
        console.log(`Marking ${ebayItem.Title} as sold`);
        await updateItemSold(
          item.id,
          ebayItem.SellingStatus.QuantitySold,
          ebayItem.ListingDetails.EndTime,
          parseFloat(ebayItem.SellingStatus.CurrentPrice.value).toFixed(2),
        );
      }
    }
  }
  console.log("Done processing sales.");
};

const processPayouts = async () => {
  await login();
  const date = new Date();
  const startDate = Date.parse(
    new Date(date.getFullYear(), date.getMonth() - 2, 1),
  );
  const endDate = Date.parse(
    new Date(date.getFullYear(), date.getMonth() - 1, 1),
  );
  const reportDate = new Date(date.getFullYear(), date.getMonth());

  const soldItems = (await getSoldItems()).filter(
    (item) =>
      Date.parse(item.soldAt) >= startDate && Date.parse(item.soldAt) < endDate,
  );

  let totals = {};
  soldItems.forEach((item) => {
    if (!totals[item.ownerId]) {
      totals[item.ownerId] = 0;
    }
    totals[item.ownerId] += parseFloat(item.currentPrice);
  });

  Object.keys(totals).forEach(async (ownerId) => {
    console.log(ownerId);
    const owner = await getOwner(ownerId);
    console.log(owner);
    const payout = {
      ownerId: ownerId,
      date: reportDate,
      amount: totals[ownerId] * owner.rate,
    };
    console.log(payout);
  });
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
  const markdownRate = process.env.MARKDOWN_RATE;
  if (!markdownRate) {
    console.error("No Markdown rate specified.");
    return;
  }
  const items = await getActiveItems();
  for (let item of items) {
    let newCurrentPrice = item.price * (1 - markdownRate * item.weeksActive);
    let currentPrice = parseFloat(Number(item.currentPrice).toFixed(2));
    let origalPrice = parseFloat(Number(item.price).toFixed(2));

    if (newCurrentPrice < 5.99) {
      newCurrentPrice = 5.99;
    }

    newCurrentPrice = newCurrentPrice.toFixed(2);

    if (currentPrice != newCurrentPrice) {
      console.log(
        `Updating ${item.id} (${item.title}) price to ${newCurrentPrice} (Originally ${origalPrice})`,
      );
      const itemResponse = await updateItem(item.id, {
        currentPrice: newCurrentPrice,
      });
      if (itemResponse.status !== 200) {
        continue;
      }
      await updateEbayListing(item.id);
    }
  }
  console.log("Done with item markdowns");
};

const getAllEbayListings = async () => {
  const url = process.env.LOCAL_API_BASE_URL + "/api/v1/ebayListings";
  const response = await axios.get(url, getHeaders());
  return response.data;
};

const getEbayListing = async (ebayListingId) => {
  const url =
    process.env.LOCAL_API_BASE_URL + "/api/v1/ebayListings/" + ebayListingId;
  const response = await axios.get(url, getHeaders());
  return response.data;
};

const listingCheck = async () => {
  console.log("Checking ebay listings...");
  await login();
  const items = await getItems();
  const activeItems = await getActiveItems();

  let itemToEbayListing = {};
  let ebayListingToItem = {};

  for (const item of items) {
    itemToEbayListing[item.id] = item.ebayListingId;
    ebayListingToItem[item.ebayListingId] = item.id;
  }

  const listings = await getAllEbayListings();

  const listingByListingId = {};
  for (const listing of listings) {
    listingByListingId[listing.ItemID] = listing;
  }

  for (const listing of listings) {
    if (!ebayListingToItem[listing.ItemID]) {
      console.log(
        `Could not find item for ebay listing ${listing.ItemID} - ${listing.Title}`,
      );
    }
  }

  for (const item of activeItems) {
    if (!listingByListingId[item.ebayListingId]) {
      console.log(
        `Could not find ebay listing for item ${item.id} - ${item.title}`,
      );
    }
  }
  console.log("Done checking ebay listings.");
};

const titleCheck = async () => {
  console.log("Starting title checks.");
  await login();
  const items = await getActiveItems();
  for (const item of items) {
    if (item.title.length > 75) {
      console.log(`${item.id} - ${item.title} has too long a title`);
    }
  }
  console.log("Done with title checks");
};

const soldCheck = async () => {
  console.log("Starting sold checks.");
  await login();
  const items = await getItems();
  for (const item of items) {
    if (item.soldAt) {
      console.log(
        `${item.id} - ${item.title} - ${item.quantity} - ${item.quantitySold} - ${item.soldAt}`,
      );
      await updateItem(item.id, {
        soldAt: null,
        quantitySold: 0,
      });
    }
  }
};

const setMinimumPrice = async () => {
  console.log("Updating minimum prices.");
  await login();

  const items = await getItems();
  for (const item of items) {
    if (item.price < 5.99) {
      console.log(`${item.id} - ${item.title} - ${item.price}`);
      const itemResponse = await updateItem(item.id, {
        price: 5.99,
        currentPrice: 5.99,
      });
      if (itemResponse.status !== 200) {
        continue;
      }
      await updateEbayListing(item.id);
    }
  }
  console.log("Done updating minimum prices.");
};

const listItem = async () => {
  console.log("Listing ready item from drafts");
  await login();

  let drafts = await getDraftItems();
  drafts.sort((a, b) => b.price - a.price);

  let startTime = new Date();
  startTime.setHours(startTime.getHours() - 24);
  const items = await getItems();
  let count = 0;
  for (const item of items) {
    if (item.listedAt && Date.parse(item.listedAt) > startTime) {
      count++;
    }
  }

  console.log(`Found ${count} items listed today`);
  if (count < process.env.LISTINGS_PER_DAY) {
    console.log("Looking for draft to list");

    for (const item of drafts) {
      if (item.ready) {
        try {
          console.log(`Listing ${item.id} - ${item.title} - ${item.price}`);
          await createEbayListing(item.id);
          console.log("Item listed successfully");
          return;
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
  console.log("No items to list!");
};

const getEbayItemTransactions = async (itemId) => {
  const url =
    process.env.LOCAL_API_BASE_URL + "/api/v1/ebayItemTransactions/" + itemId;
  const response = await axios.get(url, getHeaders());
  return response.data;
};

const getShippedAtData = async () => {
  console.log("Getting shipped data for items");
  await login();

  const items = await getSoldItems();
  for (const item of items) {
    console.log(`${item.ebayListingId} - ${item.title} - ${item.shippedAt}`);
    if (item.shippedAt) {
      continue;
    }
    let shippedAt = "";

    const transactions = await getEbayItemTransactions(item.ebayListingId);
    if (transactions.length === 0) {
      shippedAt = item.soldAt;
    }
    for (const transaction of transactions) {
      if (transaction.ShippedTime) {
        shippedAt = transaction.ShippedTime;
      }
    }
    if (shippedAt) {
      await updateItem(item.id, {
        shippedAt: shippedAt,
      });
    }
  }
  console.log("Done getting shipped info");
};

const printPickList = async () => {
  console.log("Printing pick list");
  await login();

  let toShip = [];
  const items = await getSoldItems();
  for (const item of items) {
    if (!item.shippedAt) {
      toShip.push(item);
    }
  }

  for (const item of toShip) {
    console.log(
      `${item.id} - ${item.title} - ${item.location} - Qty ${item.quantitySold}`,
    );
  }

  console.log("Finished with pick list");
};
const main = async () => {
  while (true) {
    try {
      //await processPayouts();
      //await titleCheck();
      //await listingCheck();
      //await setMinimumPrice();
      //await getShippedAtData();

      await processNewSales();
      await markdownItems();
      await listItem();

      //await printPickList();
    } catch (e) {
      console.error(e);
    }
    await sleep(1000 * 60 * 5);
  }
};

main();
