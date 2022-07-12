import api from "@/api";

let CATEGORIES = [];
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
  let newTemplates = templates.map(optionsMap);
  newTemplates.unshift({ value: "0", text: "None" });
  return newTemplates;
};

const getEbayConditionOptions = async (token, categoryId) => {
  let ebayConditions = await api.getEbayConditions(token, categoryId);
  if (!Array.isArray(ebayConditions)) {
    ebayConditions = [ebayConditions];
  }
  return ebayConditions.map((condition) => ({ value: condition.ID, text: condition.DisplayName }));
};

const getCategoryName = async (token, ebayCategoryId) => {
  if (CATEGORIES.length === 0) {
    CATEGORIES = await api.getEbayCategories(token);
  }
  return CATEGORIES.find((category) => category.id === ebayCategoryId)?.name;
};

const toast = (title, body, context) => {
  context.$bvToast.toast(body, {
    title: title,
    variant: "info",
    solid: true,
  });
};

const toastGood = (title, body, context) => {
  context.$bvToast.toast(body, {
    html: true,
    title: title,
    variant: "success",
    solid: true,
  });
};

const toastBad = (title, body, context) => {
  context.$bvToast.toast(body, {
    title: title,
    variant: "danger",
    solid: true,
    noAutoHide: true,
  });
};

export default {
  getOwnerOptions,
  getUserOptions,
  getEbayCategoryOptions,
  getTemplateOptions,
  getEbayConditionOptions,
  getCategoryName,
  toast,
  toastGood,
  toastBad,
};
