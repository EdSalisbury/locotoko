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
  let templates = await api.getTemplates(token);
  templates.sort((a, b) => (a.name > b.name ? 1 : -1));
  let newTemplates = templates.map(optionsMap);
  newTemplates.unshift({ value: "0", text: "None" });
  return newTemplates;
};

const getAcquisitionOptions = async (token) => {
  let acquisitions = await api.getAcquisitions(token);
  acquisitions.sort((a, b) => (a.date < b.date ? 1 : -1));
  let newAcquisitions = acquisitions.map((item) => ({
    value: item.id,
    text: `${item.name} - ${item.date.split("T")[0]}`,
  }));

  newAcquisitions.unshift({ value: "0", text: "None" });
  return newAcquisitions;
};

const getEbayConditionOptions = async (token, categoryId) => {
  let ebayConditions = await api.getEbayConditions(token, categoryId);
  if (!Array.isArray(ebayConditions)) {
    ebayConditions = [ebayConditions];
  }
  let newConditions = ebayConditions.map((condition) => ({ value: condition.ID, text: condition.DisplayName }));
  newConditions.unshift({ value: "0", text: "None" });
  return newConditions;
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

const readFileAsync = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export default {
  getOwnerOptions,
  getUserOptions,
  getEbayCategoryOptions,
  getTemplateOptions,
  getAcquisitionOptions,
  getEbayConditionOptions,
  getCategoryName,
  toast,
  toastGood,
  toastBad,
  readFileAsync,
  dataURLtoFile,
};
