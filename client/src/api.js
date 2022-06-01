const getItems = async (token) => {
  const url =
    process.env.VUE_APP_API_BASE_URL +
    "/api/v1/items";
  const response = await fetch(url, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return await response.json();
};

const getUsers = async (token) => {
  const url =
    process.env.VUE_APP_API_BASE_URL +
    "/api/v1/users";
  const response = await fetch(url, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return await response.json();
};

const getOwners = async (token) => {
  const url =
    process.env.VUE_APP_API_BASE_URL +
    "/api/v1/owners";
  const response = await fetch(url, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return await response.json();
};

const getEbayCategories = async (token) => {
  const url =
    process.env.VUE_APP_API_BASE_URL +
    "/api/v1/ebayCategories";
  const response = await fetch(url, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return await response.json();
};

export default {
  getItems,
  getUsers,
  getOwners,
  getEbayCategories,
};
