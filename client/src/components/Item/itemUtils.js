import api from "@/api";
import util from "@/util";

const listItem = async (id, context) => {
  try {
    await api.createEbayListing(context.token, { itemId: id });
    context.$toast.success("Listing Item Successful");
  } catch (err) {
    let messages = [];

    if (!err.response.data.message) {
      messages = [err.response.data.ShortMessage];
    } else {
      messages = err.response.data.message.map((msg) => {
        return msg.ShortMessage;
      });
    }

    const msgList = "<ul><li>" + messages.join("</li><li>") + "</ul></li>";

    context.$toast.error("Listing Item Unsuccessful!</br>Reasons:</br>" + msgList, { duration: 0 });
    const request = {
      ready: false,
    };
    await api.updateItem(context.token, id, request);
  }
};

const endItem = async (id, context) => {
  try {
    await api.endEbayListing(context.token, id, { itemId: id });
    context.$toast.success("End item listing Successful");
  } catch (err) {
    let messages = [];

    if (!err.response.data.message) {
      messages = [err.response.data.ShortMessage];
    } else {
      messages = err.response.data.message.map((msg) => {
        return msg.ShortMessage;
      });
    }

    const msgList = "<ul><li>" + messages.join("</li><li>") + "</ul></li>";

    context.$toast.error("Item ending Unsuccessful!</br>Reasons:</br>" + msgList, { duration: 0 });
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
  endItem,
  resizeImage,
  cropImage,
};
