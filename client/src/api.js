const getItems = async (token) => {
  const url = "/api/v1/items";
  const response = await fetch(url, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return await response.json();
};

const getUsers = async (token) => {
  const url = "/api/v1/users";
  const response = await fetch(url, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return await response.json();
};

const getOwners = async (token) => {
  const url = "/api/v1/owners";
  const response = await fetch(url, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return await response.json();
};

export default { getItems, getUsers, getOwners };
