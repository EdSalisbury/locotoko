const getItems = async (token) => {
  const url = "http://localhost:3333/items";
  const response = await fetch(url, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return await response.json();
};

const getUsers = async (token) => {
  const url = "http://localhost:3333/users";
  const response = await fetch(url, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return await response.json();
};

export default { getItems, getUsers };
