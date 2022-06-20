const getItems = async (token) => {
  const url = process.env.VUE_APP_API_BASE_URL + "/api/v1/items";
  const response = await fetch(url, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return await response.json();
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

const apiUrl = (resource, id = "") => {
  return process.env.VUE_APP_API_BASE_URL + `/api/v1/${resource}` + (id ? `/${id}` : "");
};

const apiHeaders = (token) => {
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

const getItem = async (token, id) => {
  const response = await fetch(apiUrl("items", id), apiHeaders(token));
  return await response.json();
};

const getTemplates = async (token) => {
  const response = await fetch(apiUrl("templates"), apiHeaders(token));
  return await response.json();
};

const getTemplate = async (token, id) => {
  const response = await fetch(apiUrl("templates", id), apiHeaders(token));
  return await response.json();
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
  getUsers,
  getOwners,
  getEbayCategories,
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  updateEbayListing,
  getEbayConditions,
  getItem,
};
