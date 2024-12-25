import { default as axios } from "axios";

const baseUrl = () => {
  if (process.env.VUE_APP_API_BASE_URL) {
    return process.env.VUE_APP_API_BASE_URL;
  }
  return window.location.protocol + "//" + window.location.hostname + ":" + window.location.port;
};

const apiUrl = (resource, id = "", action = "") => {
  return baseUrl() + `/api/v1/${resource}` + (id ? `/${id}` : "") + (action ? `/${action}` : "");
};

const apiHeaders = (token) => {
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

const itemMap = (item) => ({
  ...item,
  price: parseFloat(item.price),
  soldPrice: parseFloat(item.soldPrice),
});

const login = async (body) => {
  const url = baseUrl() + "/api/v1/auth/login";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return await response.json();
};

const getDraftItems = async (token) => {
  const response = await fetch(apiUrl("items") + "?draft=true", apiHeaders(token));
  const items = await response.json();
  return items.map(itemMap);
};

const getItems = async (token) => {
  const response = await fetch(apiUrl("items"), apiHeaders(token));
  const items = await response.json();
  return items.map(itemMap);
};

const getActiveItems = async (token) => {
  const response = await fetch(apiUrl("items") + "?sold=false", apiHeaders(token));
  const items = await response.json();
  return items.map(itemMap);
};

const getSoldItems = async (token) => {
  const response = await fetch(apiUrl("items") + "?sold=true", apiHeaders(token));
  const items = await response.json();
  return items.map(itemMap);
};

const getItem = async (token, id) => {
  const response = await fetch(apiUrl("items", id), apiHeaders(token));
  const item = await response.json();
  item.specifics = parseSpecifics(item.specifics);
  item.weight = buildWeight(item.shipWeightPounds, item.shipWeightOunces);
  item.size = buildSize(item.shipSizeWidthInches, item.shipSizeHeightInches, item.shipSizeDepthInches);
  return item;
};

const createItem = async (token, body) => {
  const response = await fetch(apiUrl("items"), {
    method: "POST",
    ...apiHeaders(token),
    body: JSON.stringify(body),
  });
  return await response.json();
};

const printItemLabel = async (token, id) => {
  return await fetch(apiUrl("items", id, "printItemLabel"), {
    method: "POST",
    ...apiHeaders(token),
  });
};

const updateItem = async (token, id, body) => {
  const response = await fetch(apiUrl("items", id), {
    method: "PATCH",
    ...apiHeaders(token),
    body: JSON.stringify(body),
  });
  return await response.json();
};

const deleteItem = async (token, id) => {
  return await fetch(apiUrl("items", id), {
    method: "DELETE",
    ...apiHeaders(token),
  });
};

const endItem = async (token, id) => {
  let item = await getItem(token, id);
  const date = new Date();
  item.endedAt = date.toISOString();

  // Send updated item to the server
  const response = await fetch(apiUrl("items", id), {
    method: "PATCH",
    ...apiHeaders(token),
    body: JSON.stringify(item), // Use the updated item object as the body
  });

  // Return the updated item or server response
  return await response.json();
};

const getUsers = async (token) => {
  const response = await fetch(apiUrl("users"), {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return await response.json();
};

const getOwner = async (token, id) => {
  const response = await fetch(apiUrl("owners", id), apiHeaders(token));
  return await response.json();
};

const getOwners = async (token) => {
  const response = await fetch(apiUrl("owners"), apiHeaders(token));
  return await response.json();
};

const updateOwner = async (token, id, payload) => {
  const response = await fetch(apiUrl("owners", id), {
    method: "PATCH",
    ...apiHeaders(token),
    body: JSON.stringify(payload),
  });
  return await response.json();
};

const getEbayCategories = async (token) => {
  const response = await fetch(apiUrl("ebayCategories"), {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return await response.json();
};

const getTemplates = async (token) => {
  const response = await fetch(apiUrl("templates"), apiHeaders(token));

  return await response.json();
};

const parseSpecifics = (specificsString) => {
  let specifics = JSON.parse(specificsString) || [];
  if (!Array.isArray(specifics)) {
    const specificsArray = [];
    for (const [key, value] of Object.entries(specifics)) {
      specificsArray.push({ key: key, value: value });
    }
    specifics = specificsArray;
  } else if (specifics.length > 0 && !Object.prototype.hasOwnProperty.call(specifics[0], "key")) {
    const specificsArray = [];
    for (const key of specifics) {
      specificsArray.push({ key: key, value: "" });
    }
    specifics = specificsArray;
  }
  return specifics;
};

const buildWeight = (pounds, ounces) => {
  return {
    pounds: pounds,
    ounces: ounces,
  };
};

const buildSize = (width, height, depth) => {
  return {
    width: width,
    height: height,
    length: depth,
  };
};

const getTemplate = async (token, id) => {
  const response = await fetch(apiUrl("templates", id), apiHeaders(token));
  const template = await response.json();
  template.specifics = parseSpecifics(template.specifics);
  template.weight = buildWeight(template.shipWeightPounds, template.shipWeightOunces);
  template.size = buildSize(template.shipSizeWidthInches, template.shipSizeHeightInches, template.shipSizeDepthInches);

  return template;
};

const createTemplate = async (token, template) => {
  const response = await fetch(apiUrl("templates"), {
    method: "POST",
    ...apiHeaders(token),
    body: JSON.stringify(template),
  });
  return await response.json();
};

const updateTemplate = async (token, id, template) => {
  const response = await fetch(apiUrl("templates", id), {
    method: "PATCH",
    ...apiHeaders(token),
    body: JSON.stringify(template),
  });
  return await response.json();
};

const deleteTemplate = async (token, id) => {
  return await fetch(apiUrl("templates", id), {
    method: "DELETE",
    ...apiHeaders(token),
  });
};

const createEbayListing = async (token, request) => {
  const response = await axios.post(apiUrl("ebayListings"), request, apiHeaders(token));
  return response.data;
};

const updateEbayListing = async (token, id, request) => {
  const response = await axios.patch(apiUrl("ebayListings", id), request, apiHeaders(token));
  return response.data;
};

const getEbayConditions = async (token, categoryId) => {
  const response = await fetch(apiUrl("ebayConditions", categoryId), apiHeaders(token));
  return await response.json();
};

const getEbaySpecifics = async (token, categoryId) => {
  const response = await fetch(apiUrl("ebaySpecifics", categoryId), apiHeaders(token));
  return await response.json();
};

const getAcquisitions = async (token) => {
  const response = await fetch(apiUrl("acquisitions"), apiHeaders(token));

  return await response.json();
};

const getAcquisition = async (token, id) => {
  const response = await fetch(apiUrl("acquisitions", id), apiHeaders(token));
  return await response.json();
};

const createAcquisition = async (token, acquisition) => {
  const response = await fetch(apiUrl("acquisitions"), {
    method: "POST",
    ...apiHeaders(token),
    body: JSON.stringify(acquisition),
  });
  return await response.json();
};

const updateAcquisition = async (token, id, acquisition) => {
  const response = await fetch(apiUrl("acquisitions", id), {
    method: "PATCH",
    ...apiHeaders(token),
    body: JSON.stringify(acquisition),
  });
  return await response.json();
};

const deleteAcquisition = async (token, id) => {
  return await fetch(apiUrl("acquisitions", id), {
    method: "DELETE",
    ...apiHeaders(token),
  });
};

const lookupProduct = async (token, upc) => {
  const response = await fetch(apiUrl("products", upc), apiHeaders(token));
  return await response.json();
};

const getOrders = async (token) => {
  const response = await fetch(apiUrl("ebayOrders"), apiHeaders(token));
  return await response.json();
};

const getPicks = async (token) => {
  const response = await fetch(apiUrl("picks"), apiHeaders(token));
  return await response.json();
};

const getOrder = async (token, id) => {
  const response = await fetch(apiUrl("ebayOrders", id), apiHeaders(token));
  return await response.json();
};

const getMetrics = async (token) => {
  const response = await fetch(apiUrl("metrics"), apiHeaders(token));
  return await response.json();
}

export default {
  login,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  printItemLabel,
  getUsers,
  getOwners,
  getOwner,
  updateOwner,
  getEbayCategories,
  getEbaySpecifics,
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getAcquisitions,
  getAcquisition,
  createAcquisition,
  updateAcquisition,
  deleteAcquisition,
  createEbayListing,
  updateEbayListing,
  getEbayConditions,
  lookupProduct,
  getSoldItems,
  getActiveItems,
  getDraftItems,
  getOrders,
  getOrder,
  getPicks,
  getItems,
  getMetrics,
};
