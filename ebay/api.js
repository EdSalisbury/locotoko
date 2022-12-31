import { default as axios } from "axios";

let TOKEN;

const apiUrl = (resource, id = "", action = "") => {
  return (
    process.env.LOCAL_API_BASE_URL +
    `/api/v1/${resource}` +
    (id ? `/${id}` : "") +
    (action ? `/${action}` : "")
  );
};

const getHeaders = () => {
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    },
  };
};

export const login = async () => {
  const url = process.env.LOCAL_API_BASE_URL + "/api/v1/auth/login";
  const request = {
    email: process.env.EBAY_EMAIL,
    password: process.env.EBAY_PASSWORD,
  };
  const response = await axios.post(url, request, getHeaders());
  TOKEN = response.data.access_token;
};

export const createEbayListing = async (id) => {
  const url = process.env.LOCAL_API_BASE_URL + "/api/v1/ebayListings";
  const request = {
    itemId: id,
  };
  const response = await axios.post(url, request, getHeaders());
  return response.data;
};

export const getItems = async () => {
  const url = process.env.LOCAL_API_BASE_URL + "/api/v1/items";
  const response = await axios.get(url, getHeaders());
  return response.data;
};

export const getActiveItems = async () => {
  const url = process.env.LOCAL_API_BASE_URL + "/api/v1/items?sold=false";
  const response = await axios.get(url, getHeaders());
  return response.data;
};

export const getSoldItems = async () => {
  const url = process.env.LOCAL_API_BASE_URL + "/api/v1/items?sold=true";
  const response = await axios.get(url, getHeaders());
  return response.data;
};

export const getDraftItems = async () => {
  const url = process.env.LOCAL_API_BASE_URL + "/api/v1/items?draft=true";
  const response = await axios.get(url, getHeaders());
  return response.data;
};

export const getItem = async (itemId) => {
  const url = process.env.LOCAL_API_BASE_URL + "/api/v1/items/" + itemId;
  const response = await axios.get(url, getHeaders());
  return response.data;
};

export const getOwner = async (ownerId) => {
  const response = await axios.get(apiUrl("owners", ownerId), getHeaders());
  return response.data;
};

export const getItemByEbayItemId = async (ebayItemId) => {
  const items = await getItems();
  const filtered = items.filter((item) => item.ebayListingId == ebayItemId);
  return filtered[0];
};

export const updateItemSold = async (
  itemId,
  quantitySold,
  endTime,
  soldPrice,
) => {
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

export const getSellerEvents = async () => {
  const url = process.env.LOCAL_API_BASE_URL + "/api/v1/ebaySellerEvents";
  const response = await axios.get(url, getHeaders());
  return response.data;
};

export const getEbayOrders = async () => {
  const response = await axios.get(apiUrl("ebayOrders"), getHeaders());
  return response.data;
};

export const updateItem = async (id, request) => {
  const url = apiUrl("items", id);
  try {
    const response = await axios.patch(url, request, getHeaders());
    console.log(`Updated item ${id} successfully.`);
    return response;
  } catch (e) {
    console.error(
      `Unable to update item ${id} with payload:\n${JSON.stringify(
        request,
      )}:\n${JSON.stringify(e.response.data)}\n\n`,
    );
    return e.response;
  }
};

export const updateEbayListing = async (id) => {
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

export const getEbayItemTransactions = async (itemId) => {
  const url =
    process.env.LOCAL_API_BASE_URL + "/api/v1/ebayItemTransactions/" + itemId;
  const response = await axios.get(url, getHeaders());
  return response.data;
};

export const getAllEbayListings = async () => {
  const url = process.env.LOCAL_API_BASE_URL + "/api/v1/ebayListings";
  const response = await axios.get(url, getHeaders());
  return response.data;
};

export const getEbayListing = async (ebayListingId) => {
  const url =
    process.env.LOCAL_API_BASE_URL + "/api/v1/ebayListings/" + ebayListingId;
  const response = await axios.get(url, getHeaders());
  return response.data;
};

export const getEbayMarkdowns = async () => {
  const response = await axios.get(apiUrl("ebayMarkdowns"), getHeaders());
  return response.data;
};

export const getEbayMarkdown = async (id) => {
  const response = await axios.get(apiUrl("ebayMarkdowns", id), getHeaders());
  return response.data;
};

export const createEbayMarkdown = async (payload) => {
  const response = await axios.post(
    apiUrl("ebayMarkdowns"),
    payload,
    getHeaders(),
  );
  return response.data;
};

export const updateEbayMarkdown = async (id, payload) => {
  const response = await axios.post(
    apiUrl("ebayMarkdowns", id),
    payload,
    getHeaders(),
  );
  return response.data;
};

export const deleteEbayMarkdown = async (id) => {
  const response = await axios.delete(
    apiUrl("ebayMarkdowns", id),
    getHeaders(),
  );
  return response.data;
};
