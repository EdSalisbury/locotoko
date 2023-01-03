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