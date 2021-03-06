const apiUrl = (resource, id = "", action = "") => {
  return process.env.VUE_APP_API_BASE_URL + `/api/v1/${resource}` + (id ? `/${id}` : "") + (action ? `/${action}` : "");
};

const apiHeaders = (token) => {
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

const getItems = async (token) => {
  const response = await fetch(apiUrl("items"), apiHeaders(token));
  return await response.json();
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

const getUsers = async (token) => {
  const url = process.env.VUE_APP_API_BASE_URL + "/api/v1/users";
  const response = await fetch(url, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return await response.json();
};

const getOwners = async (token) => {
  const url = process.env.VUE_APP_API_BASE_URL + "/api/v1/owners";
  const response = await fetch(url, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return await response.json();
};

const getEbayCategories = async (token) => {
  const url = process.env.VUE_APP_API_BASE_URL + "/api/v1/ebayCategories";
  const response = await fetch(url, {
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

const createEbayListing = async (token, body) => {
  return await fetch(apiUrl("ebayListings"), {
    method: "POST",
    ...apiHeaders(token),
    body: JSON.stringify(body),
  });
};

const updateEbayListing = async (token, id, body) => {
  return await fetch(apiUrl("ebayListings", id), {
    method: "PATCH",
    ...apiHeaders(token),
    body: JSON.stringify(body),
  });
};

const getEbayConditions = async (token, categoryId) => {
  const response = await fetch(apiUrl("ebayConditions", categoryId), apiHeaders(token));
  return await response.json();
};

export default {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  printItemLabel,
  getUsers,
  getOwners,
  getEbayCategories,
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  createEbayListing,
  updateEbayListing,
  getEbayConditions,
};
