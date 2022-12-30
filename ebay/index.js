import { config } from "dotenv";
import "dotenv/config";
import * as api from "./api.js";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

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
          soldPrice: item.price,
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

const getMarkdownPercentage = (price, weeksActive) => {
  let pct = 0;
  let markdownPrice = 0;

  pct = (weeksActive - process.env.WEEKS_BEFORE_MARKDOWN) * 5;
  while (markdownPrice < process.env.MIN_PRICE && pct < 100) {
    pct -= 5;
    markdownPrice = ((100 - pct) / 100) * price;
  }
  return pct;
};

const newMarkdownItems = async () => {
  console.log("Marking down items... ");
  await api.login();
  const items = await api.getActiveItems();

  for (let item of items.slice(-2)) {
    console.log(`Processing ${item.title}: ${item.id}`);
    const pct = getMarkdownPercentage(
      item.price,
      item.weeksActive,
    );
    if (item.markdownPct === pct) {
      continue;
    }
    console.log(`Item's new markdown percentage: ${pct}`);
    console.log(`Item's current markdown percentage: ${item.markdownPct}`);
    if (item.markdownPct) {
      console.log("Removing from current markdown");
      // Check to see if it's the last item in the markdown

      // If not, remove from current markdown
    }
    // Get appropriate markdown
    console.log("Get appropriate markdown");

    // If it doesn't exist, add it
    console.log("Add markdown if needed, with itemId");
    // Add to appropriate markdown

    console.log("Add to markdown if found");

    // If successful:
    // const request = {
    //   markdownPct: pct,
    // };
    // await updateItem(item.id, request);
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
          console.error("ERROR: " + e.response.data.LongMessage);
          const request = {
            ready: false,
          };
          console.log(`Marking item ${item.id} as NOT ready`);
          await updateItem(item.id, request);
        }
      }
    }
  }
  console.log("No items to list!");
};

const updateShippedData = async () => {
  console.log("Getting shipped data for items");
  await login();

  const items = await getSoldItems();
  for (const item of items) {
    if (item.shippedAt && item.soldAt && item.soldPrice) {
      continue;
    }
    console.log(
      `${item.ebayListingId} - ${item.title} - Shipped At: ${item.shippedAt} Sold At: ${item.soldAt} Sold Price: ${item.soldPrice}`,
    );
    let request = {};
    const transactions = await getEbayItemTransactions(item.ebayListingId);
    if (transactions.length === 0) {
      request.shippedAt = item.soldAt;
      request.soldPrice = parseFloat(item.currentPrice).toFixed(2);
    } else {
      for (const transaction of transactions) {
        if (transaction.ShippedTime) {
          request.shippedAt = transaction.ShippedTime;
          request.soldPrice = transaction.AmountPaid.value.toFixed(2);
        }
      }
    }
    await updateItem(item.id, request);
  }
  console.log("Done getting shipped info");
};

const main = async () => {
  console.log("Sleeping 1 minute to wait for the server to come up...");
  //await sleep(1000 * 60);

  while (true) {
    try {
      //await processPayouts();
      //await titleCheck();
      //await listingCheck();
      //await setMinimumPrice();
      //await updateShippedData();

      //await processNewSales();
      //await markdownItems();
      //await listItem();
      await newMarkdownItems();
    } catch (e) {
      console.error(e);
    }
    await sleep(1000 * 60 * 5);
  }
};

main();
