import api from "@/api";
import util from "@/util";

const listItem = async (id, context) => {
  const response = await api.createEbayListing(context.token, { itemId: id });
  if (response.status == 201) {
    context.$toast.success("Listing Item Successful");
    // TODO: Make this only get the appropriate item
    context.items = await api.getActiveItems(context.token);
    context.items.sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));
  } else {
    const err = await response.json();
    let errMsgs = [];
    if (err.message) {
      errMsgs = err.message;
    } else {
      errMsgs = [err];
    }
    const msgs = errMsgs.map((msg) => "<li>" + msg.ShortMessage + "</li>");
    let msg = "<ul>" + msgs.join("") + "</ul>";
    context.$toast.error("Listing Item Unsuccessful!</br>Reasons:</br>" + msg, { duration: 0 });
    console.error(err);
  }
};

const resizeImage = async (file) => {
  const maxSideSize = 1600;

  const image = new Image();
  image.src = await util.readFileAsync(file);
  await image.decode();
  if (image.width <= maxSideSize && image.height <= maxSideSize) {
    return image.src;
  }

  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  if (image.width > image.height) {
    if (image.width > maxSideSize) {
      canvas.height *= maxSideSize / image.width;
      canvas.width = maxSideSize;
    }
  } else {
    if (image.height > maxSideSize) {
      canvas.width *= maxSideSize / image.height;
      canvas.height = maxSideSize;
    }
  }
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.7);
};

const cropImage = async (file, ratio = 1.3333) => {
  const image = new Image();
  image.src = await util.readFileAsync(file);
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.height * ratio);
  canvas.height = image.height;
  const left = (image.width - canvas.width) / 2;
  const context = canvas.getContext("2d");
  context.drawImage(image, left, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.7);
};

export default {
  listItem,
  resizeImage,
  cropImage,
};
