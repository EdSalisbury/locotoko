const encodeSpecialChars = (str: string) => {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("'", "&apos;")
    .replaceAll('\\"', "&quot;");
};

const decodeSpecialChars = (str: string) => {
  return str
    .replaceAll("&amp;", "&")
    .replaceAll("&apos;", "'")
    .replaceAll("&quot;", '\\"');
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

const getWeeksDiff = (startDate: Date, endDate: Date) => {
  if (!startDate) {
    return 0;
  }
  const msInWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(
    Math.abs(endDate.valueOf() - startDate.valueOf()) / msInWeek,
  );
};

export {
  encodeSpecialChars,
  decodeSpecialChars,
  encodeSpecialCharsInObject,
  decodeSpecialCharsInObject,
  getWeeksDiff,
};
