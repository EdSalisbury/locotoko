const encodeSpecialChars = (str: string) => {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("'", "&apos;")
    .replaceAll('"', "&quot;");
};

const decodeSpecialChars = (str: string) => {
  return str
    .replaceAll("&amp;", "&")
    .replaceAll("&apos;", "'")
    .replaceAll("&quot;", '"');
};

const decodeSpecialCharsInObject = (obj: Object) => {
  try {
    const str = JSON.stringify(obj);
    const decodedStr = decodeSpecialChars(str);
    return JSON.parse(decodedStr);
  } catch (e) {
    console.error("Unable to parse object: " + e);
    return obj;
  }
};

const encodeSpecialCharsInObject = (obj: Object) => {
  try {
    const str = JSON.stringify(obj);
    const encodedStr = encodeSpecialChars(str);
    return JSON.parse(encodedStr);
  } catch (e) {
    console.error("Unable to parse object: " + e);
    return obj;
  }
};

export {
  encodeSpecialChars,
  decodeSpecialChars,
  encodeSpecialCharsInObject,
  decodeSpecialCharsInObject,
};
