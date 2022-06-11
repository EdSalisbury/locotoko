import api from "@/api";

const optionsMap = (item) => ({ value: item.id, text: item.name });

const getUserOptions = async (token) => {
  const users = await api.getUsers(token);
  return users.map(optionsMap);
};

const getOwnerOptions = async (token) => {
  const owners = await api.getOwners(token);
  return owners.map(optionsMap);
};

const getEbayCategoryOptions = async (token) => {
  const ebayCategories = await api.getEbayCategories(token);
  const filteredCategories = ebayCategories.filter((cat) => cat.level === 1);
  return filteredCategories.map(optionsMap);
};

const getTemplateOptions = async (token) => {
  const templates = await api.getTemplates(token);
  return templates.map(optionsMap);
};

export default {
  getOwnerOptions,
  getUserOptions,
  getEbayCategoryOptions,
  getTemplateOptions,
};
