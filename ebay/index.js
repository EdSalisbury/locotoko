import * as api from "./api.js";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const processSales = async () => {
  console.log("Processing sales... ");
  await api.login();
  const orders = await api.getEbayOrders();
  for (const order of orders) {
    for (const ebayItem of order.items) {
      const item = await api.getItemByEbayItemId(ebayItem.ebayItemId);
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
          endedAt: order.paidTime,
          soldPrice: parseFloat(item.currentPrice).toFixed(2),
        };
        await api.updateItem(item.id, request);
      }
    }
  }
  console.log("Done processing sales.");
};

const getMarkdownPercentage = (price, weeksActive) => {
  let pct = 0;
  let markdownPrice = 0;

  pct = (weeksActive - process.env.WEEKS_BEFORE_MARKDOWN) * 5;

  if (pct <= 0) {
    return 0;
  }
  while (markdownPrice < process.env.MIN_PRICE) {
    pct -= 5;
    markdownPrice = ((100 - pct) / 100) * price;
    if (pct <= 0) {
      return 0;
    }
  }
  if (pct > 80) {
    return 80;
  }
  return pct;
};

const newMarkdownItems = async () => {
  console.log("Marking down items... ");
  await api.login();

  // Get all current markdowns
  let markdowns = [];
  const response = await api.getEbayMarkdowns();
  for (const promotion of response.promotions) {
    if (promotion.name.startsWith("md-")) {
      const details = await api.getEbayMarkdown(promotion.promotionId);
      const pct = promotion.name.split("md-")[1];

      markdowns.push({
        pct: parseInt(pct),
        id: promotion.promotionId,
        listingIds:
          details.selectedInventoryDiscounts[0].inventoryCriterion.listingIds,
      });
    }
  }

  const items = await api.getActiveItems();

  for (let item of items) {
    console.log(`Processing ${item.title}: ${item.ebayListingId}`);
    const pct = getMarkdownPercentage(item.price, item.weeksActive);
    if (pct === 0) {
      console.log("0% markdown, skipping");
      continue;
    }

    let done = false;

    for (const md of markdowns) {
      if (md.listingIds.includes(item.ebayListingId)) {
        console.log(`Found item in md-${pct}`);
        done = true;
        break;
      }
    }

    if (done) {
      continue;
    }

    //console.log(`Item's current markdown percentage: ${item.markdownPct}`);
    // if (item.markdownPct) {
    // for (const md of markdowns) {
    //   if (md.pct === item.markdownPct) {
    //     md.listingIds = md.listingIds.filter(
    //       (id) => id !== item.ebayListingId,
    //     );
    //     if (md.listingIds.length === 0) {
    //       console.log("Last item -- removing markdown from ebay");
    //       await api.deleteEbayMarkdown(md.id);
    //       markdowns = markdowns.filter((item) => item.pct !== md.pct);
    //     } else {
    //       console.log("Updating ebay markdown with new listingIds");
    //       await api.updateEbayMarkdown(md.id, { listingIds: md.listingIds });
    //     }
    //     break;
    //   }
    // }
    //}

    let success = false;
    for (const md of markdowns) {
      if (md.pct === pct) {
        console.log(`Adding to markdown md-${md.pct}\n`);
        md.listingIds.push(item.ebayListingId);
        await api.updateEbayMarkdown(md.id, { itemIds: md.listingIds });
        success = true;
        break;
      }
    }

    if (!success) {
      console.log(`Creating markdown md-${pct}\n`);
      try {
        await api.createEbayMarkdown({
          percentage: pct.toString(),
          itemIds: [item.ebayListingId],
        });
      } catch (e) {
        console.log(e.response.data);
      }
      // console.log("Waiting one minute for the markdown to become active");
      // await sleep(60000);
      const response = await api.getEbayMarkdowns();
      for (const promotion of response.promotions) {
        if (promotion.name === `md-${pct}`) {
          const details = await api.getEbayMarkdown(promotion.promotionId);
          markdowns.push({
            pct: parseInt(pct),
            id: promotion.promotionId,
            listingIds:
              details.selectedInventoryDiscounts[0].inventoryCriterion
                .listingIds,
          });
          console.log("Got new markdown data");
          success = true;
          break;
        }
      }
    }

    if (success) {
      const request = {
        markdownPct: pct,
      };
      await api.updateItem(item.id, request);
    }
  }
  console.log("Done marking down items");
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

const listItem = async () => {
  console.log("Listing ready item from drafts");
  await api.login();

  let drafts = await api.getDraftItems();
  drafts.sort((a, b) => b.price - a.price);

  let startTime = new Date();
  startTime.setHours(startTime.getHours() - 24);
  const items = await api.getItems();
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
          await api.createEbayListing(item.id);
          console.log("Item listed successfully");
          return;
        } catch (e) {
          console.error("ERROR: " + e.response.data.LongMessage);
          const request = {
            ready: false,
          };
          console.log(`Marking item ${item.id} as NOT ready`);
          await api.updateItem(item.id, request);
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

const updateEndedListings = async () => {
  await api.login();
  const items = await api.getItems();
  for (const item of items) {
    console.log(item.title);
    if (!item.ebayListingId) {
      console.log("Item not listed yet");
      continue;
    }
    if (item.endedAt) {
      console.log("Item already ended");
      continue;
    }
    try {
      const ebayItem = await api.getEbayListing(item.ebayListingId);
      const endTime = Date.parse(ebayItem.Item.ListingDetails.EndTime);
      const startTime = Date.parse(ebayItem.Item.ListingDetails.StartTime);
      if (!item.listedAt) {
        console.log(
          `ListedAt not set, setting to: ${new Date(startTime).toISOString()}`,
        );
        await api.updateItem(item.id, {
          listedAt: new Date(startTime).toISOString(),
        });
      }
      if (endTime < Date.now()) {
        console.log("Item has ended");
        await api.updateItem(item.id, {
          endedAt: new Date(endTime).toISOString(),
        });
      }
    } catch (e) {
      if (!item.listedAt) {
        await api.updateItem(item.id, {
          listedAt: item.createdAt,
        });
      }
      if (!item.endedAt) {
        await api.updateItem(item.id, {
          endedAt: item.soldAt,
        });
      }
    }
  }
};

const updateSoldAt = async () => {
  await api.login();
  const items = await api.getItems();
  for (const item of items) {
    if (item.endedAt && !item.soldAt) {
      console.log(item.title);
      const ebayItem = await api.getEbayListing(item.ebayListingId);
      if (ebayItem.Item.SellingStatus.QuantitySold) {
        await api.updateItem(item.id, {
          soldAt: item.endedAt,
          quantitySold: ebayItem.Item.SellingStatus.QuantitySold,
        });
      }
    }
  }
};

const removeStaleItems = async () => {
  console.log("Ending items that have been on sale for at least 24 weeks...");
  await api.login();
  const items = await api.getActiveItems();
  for (const item of items) {
    if (item.weeksActive > 23 && !item.ebayCategoryName.startsWith("Comics")) {
      console.log(
        `Remove ${item.title} @ $${item.currentPrice} - weeksActive = ${item.weeksActive}`,
      );

      try {
        await api.updateEbayListing(item.id, true);
        await api.updateItem(item.id, {
          endedAt: new Date(Date.now()).toISOString(),
        });
      } catch {
        console.log("Unable to end item");
      }
    }
  }
  console.log("Done ending items");
};

const updatePricing = async () => {
  console.log("Updating pricing data for items...");
  await api.login();
  const items = await api.getActiveItems();
  for (const item of items) {
    if (!item.shippingPrice || !item.shippingType) {
      let shippingType = 0;
      let shippingPrice = 0;

      if (item.ebayCategoryName.startsWith("CCG") && item.currentPrice < 20) {
        shippingType = 1;
        shippingPrice = 1;
      } else if (item.shipWeightPounds === 0) {
        shippingType = 2;
        shippingPrice = 5;
      } else {
        shippingType = 99;
        shippingPrice = 11 + item.shipWeightPounds;
      }
      console.log(
        `${item.title} - weight: ${item.shipWeightPounds} category: ${item.ebayCategoryName} price: ${item.currentPrice} shippingType: ${shippingType} shippingPrice: ${shippingPrice}`,
      );
      await api.updateItem(item.id, {
        shippingType: shippingType,
        shippingPrice: shippingPrice.toFixed(2),
      });
    }
  }
  console.log("Done updating prices");
};

const updateCurrentPricing = async () => {
  console.log("Updating pricing data for items...");
  await api.login();
  const markdownRate = process.env.MARKDOWN_RATE;
  const items = await api.getActiveItems();
  for (const item of items) {
    let price = item.price * (1 + markdownRate * item.weeksActive);
    if (price !== item.price) {
      console.log(`${item.title} - price: ${item.price}, new price: ${price}`);
      await api.updateItem(item.id, {
        price: parseFloat(price).toFixed(2),
      });
    }
  }
  console.log("Done updating prices");
};

const updateEbayListings = async () => {
  console.log("Updating ebay listings...");
  await api.login();
  const ebayItems = await api.getAllEbayListings();
  const items = await api.getActiveItems();
  for (const item of items) {
    const ebayItem = ebayItems.filter(
      (ebayItem) => ebayItem.ItemID.toString() === item.ebayListingId,
    )[0];
    if (
      ebayItem &&
      parseFloat(ebayItem.BuyItNowPrice.value).toFixed(2) !==
        (parseFloat(item.price) + parseFloat(item.shippingPrice)).toFixed(2)
    ) {
      console.log(`${item.title}, ${item.price}, ${item.shippingPrice}`);
      await api.updateEbayListing(item.id);
    }
  }
  console.log("Done with updating listings");
};
const main = async () => {
  console.log("Sleeping 1 minute to wait for the server to come up...");
  //await sleep(1000 * 60);

  while (true) {
    try {
      await updateEbayListings();
      //await updatePricing();
      //await updateCurrentPricing();
      //await removeStaleItems();
      //await processSales();
      //await listItem();
      //await newMarkdownItems();
    } catch (e) {
      console.error(e);
    }
    await sleep(1000 * 60 * 5);
  }
};

main();
