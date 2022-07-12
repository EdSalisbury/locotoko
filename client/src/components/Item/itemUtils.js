import api from "@/api";
import util from "@/util";

const listItem = async (id, context) => {
  const response = await api.createEbayListing(context.token, { itemId: id });
  if (response.status == 201) {
    util.toastGood("Listing Item Successful", "Success!", context);

    // TODO: Make this only get the appropriate item
    context.items = await api.getItems(context.token);
    context.items.sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));
  } else {
    const err = await response.json();
    util.toastBad("Listing Item Unsuccessful", JSON.stringify(err), context);
    console.error(err);
  }
};

export default {
  listItem,
};
