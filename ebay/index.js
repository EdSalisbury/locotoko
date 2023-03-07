import * as api from "./api.js";

let listLowPrice = true;

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
          `Unable to find item with eBay Listing ID: ${ebayItem.ebayItemId} (${ebayItem.title})`,
        );
        continue;
      }
      if (item.soldAt !== order.paidTime) {
        console.log(`Marking ${item.title} as sold`);
        const request = {
          quantitySold: item.quantitySold + ebayItem.quantity,
          soldAt: order.paidTime,
          endedAt: order.paidTime,
          soldPrice: parseFloat(item.price).toFixed(2),
        };
        await api.updateItem(item.id, request);
      }
    }
  }
  console.log("Done processing sales.");
};

const getMarkdownPercentage = (price, shippingPrice, weeksActive) => {
  let pct = 0;

  pct =
    (weeksActive - process.env.WEEKS_BEFORE_MARKDOWN) *
    process.env.MARKDOWN_PERCENT_PER_WEEK;

  if (pct <= 0) {
    return 0;
  }

  let done = false;
  while (!done) {
    const markdownPrice =
      parseFloat((100 - pct) / 100) * (price + shippingPrice);
    if (
      markdownPrice >
      parseFloat(process.env.MIN_PRICE) + parseFloat(shippingPrice)
    ) {
      done = true;
    } else {
      pct -= 5;
    }
  }

  if (pct <= 0) {
    return 0;
  }

  if (pct > 80) {
    return 80;
  }
  return pct;
};


const getMarkdowns = async () => {
  // Get all current markdowns
  let markdowns = [];
  const response = await api.getEbayMarkdowns();
  for (const promotion of response.promotions) {
    if (
      promotion.promotionStatus !== "ENDED" &&
      promotion.name.startsWith("md-")
    ) {
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
  return markdowns;
}

const markdownItems = async () => {
  console.log("Marking down items... ");
  await api.login();

  let markdowns = await getMarkdowns();

  const items = await api.getActiveItems();

  for (let item of items) {
    console.log(
      `Processing ${item.title}: ${item.ebayListingId} weeksActive = ${item.weeksActive}, price = ${item.price}, shipping price = ${item.shippingPrice} (${item.markdownPct}%)`,
    );
    const pct = getMarkdownPercentage(
      parseFloat(item.price),
      parseFloat(item.shippingPrice),
      parseInt(item.weeksActive),
    );

    const mult = (100 - pct) / 100;
    const total = parseFloat(item.price) + parseFloat(item.shippingPrice);
    const mdTotal = total * mult;

    console.log(
      `Markdown percentage = ${pct}, Total price = ${total}, Total price after markdown: ${mdTotal}`,
    );

    // 0% Case
    if (pct === 0) {
      if (item.markdownPct === 0) {
        console.log("0% markdown - nothing to update");
      } else if (!item.markdownPct) {
        console.log("0% markdown, setting to 0");
        await api.updateItem(item.id, { markdownPct: 0 });
      }
      continue;
    }

    // Look for existing markdown
    let markdownId = "";
    let markdownPct = "";
    for (const md of markdowns) {
      if (md.listingIds.includes(item.ebayListingId)) {
        console.log(`Found item in md-${md.pct}`);
        markdownId = md.id;
        markdownPct = md.pct;
        break;
      }
    }

    // Check to see if the markdown is in the right place
    if (
      pct === markdownPct &&
      pct === item.markdownPct &&
      markdownPct === item.markdownPct
    ) {
      console.log("Item is at correct markdown");
      continue;
    }

    // Remove/add/create markdowns
    if (markdownPct !== pct) {
      if (markdownId) {
        const md = markdowns.filter((md) => md.id === markdownId)[0];
        console.log(`Removing from md-${markdownPct}`);
        md.listingIds = md.listingIds.filter((id) => id !== item.ebayListingId);
        const response = await api.updateEbayMarkdown(markdownId, {
          itemIds: md.listingIds,
        });
      }
      const md = markdowns.filter((md) => md.pct === pct)[0];
      if (md) {
        console.log(`Adding to md-${pct}`);
        md.listingIds.push(item.ebayListingId);
        await api.updateEbayMarkdown(md.id, { itemIds: md.listingIds });
        const md2 = markdowns.filter((md) => md.pct === pct)[0];
      } else {
        console.log(`Creating md-${pct}`);
        await api.createEbayMarkdown({
          percentage: pct.toString(),
          itemIds: [item.ebayListingId],
        });
        markdowns = await getMarkdowns();
      }
      await api.updateItem(item.id, { markdownPct: pct });
    }
  }

  console.log("Done marking down items");
};

const listItem = async () => {
  console.log("Listing ready item from drafts");
  await api.login();

  let drafts = await api.getDraftItems();

  if (listLowPrice) {
    drafts.sort((a, b) => a.price - b.price);
  } else {
    drafts.sort((a, b) => b.price - a.price);
  }
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
          listLowPrice = !listLowPrice;
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

const removeStaleItems = async () => {
  console.log("Ending items that have been on sale for at least 24 weeks...");
  await api.login();
  const items = await api.getActiveItems();
  for (const item of items) {
    if (item.weeksActive > 23 && !item.ebayCategoryName.startsWith("Comics")) {
      console.log(
        `Remove ${item.title} @ $${item.price} - weeksActive = ${item.weeksActive}`,
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

const fixDrafts = async () => {
  console.log("Fixing drafts");
  await api.login();
  const items = await api.getItems();
  for (const item of items) {
    if (!item.ebayListingId && item.status === "ended") {
      console.log(item.title);
      await api.updateItem(item.id, {
        endedAt: null,
      });
    }
  }
  console.log("Done fixing drafts");
};

const fixEndedAt = async () => {
  console.log("Fixing endedAt");
  await api.login();
  const items = await api.getItems();

  for (const item of items) {
    try {
      const details = await api.getEbayListing(item.ebayListingId);
      const endTime = Date.parse(details.Item.ListingDetails.EndTime);

      console.log(
        `${item.title} - endTime = ${new Date(
          endTime,
        ).toISOString()}, endedAt = ${item.endedAt}`,
      );

      if (endTime < Date.now() && !item.endedAt) {
        console.log("Set endedAt to endTime");
        await api.updateItem(item.id, {
          endedAt: new Date(endTime).toISOString(),
        });
      }

      if (endTime > Date.now() && item.endedAt) {
        console.log("Set endedAt to null");
        await api.updateItem(item.id, { endedAt: null });
      }
    } catch {}
  }
  console.log("Done fixing endedAt");
};

const makeDrafts = async () => {
  console.log("Making ended items into drafts where appropriate");
  await api.login();
  const items = await api.getItems();

  for (const item of items) {
    if (item.endedAt && !item.soldAt) {
      console.log(
        `${item.title} endedAt = ${item.endedAt} soldAt = ${item.soldAt} weeksActive = ${item.weeksActive} price = ${item.price}`,
      );
      if (
        item.price > 9 &&
        item.quantity === 1 &&
        (item.weeksActive < 24 || item.ebayCategoryName.startsWith("Comics"))
      ) {
        console.log(`Making into a draft`);
        await api.updateItem(item.id, {
          ebayListingId: "",
          endedAt: null,
          listedAt: null,
          ready: false,
          markdownPct: 0,
        });
      }
    }
  }
  console.log("Done making drafts");
};

const fixMarkdowns = async () => {
  console.log("Fixing markdowns... ");
  await api.login();
  const items = await api.getActiveItems();
  const response = await api.getEbayMarkdowns();

  for (const promotion of response.promotions) {
    const markdown = await api.getEbayMarkdown(promotion.promotionId);
    const listingIds =
      markdown.selectedInventoryDiscounts[0].inventoryCriterion.listingIds;
    let newListingIds = [];
    for (const listingId of listingIds) {
      const find = items.filter((item) => item.ebayListingId === listingId);
      if (find.length > 0) {
        newListingIds.push(listingId);
      }
    }
    if (newListingIds.length != listingIds.length) {
      console.log(`Updating markdown ${promotion.name} with new listingIds`);
      console.log(promotion.promotionId);
      console.log(listingIds);
      console.log(JSON.stringify(newListingIds));
      const response = await api.updateEbayMarkdown(promotion.promotionId, {
        itemIds: newListingIds,
      });
      console.log(response);
      return;
    }
  }
  console.log("Done fixing markdowns");
};

const main = async () => {
  console.log("Sleeping 1 minute to wait for the server to come up...");
  await sleep(1000 * 60);

  let lastMarkdown = 0;

  while (true) {
    try {
      await processSales();
      await listItem();
      if (Date.now() > lastMarkdown + 1000 * 60 * 60 * 24) {
        await markdownItems();
        lastMarkdown = Date.now();
      }
    } catch (e) {
      console.error(e);
    }
    await sleep(1000 * 60 * 5);
  }
};

main();
