// Drop-in replacement for vue-cookie (Vue 2 only), keeping the same
// this.$cookie.get/set/delete API so components don't change.
import Cookies from "js-cookie";

// vue-cookie accepted expires like "24h"; js-cookie wants days (or a Date).
// expires: 0 meant "delete".
const toJsCookieOptions = (options = {}) => {
  const { expires } = options;
  if (typeof expires === "string") {
    const match = /^(\d+)\s*([hdHD])$/.exec(expires.trim());
    if (match) {
      const amount = Number(match[1]);
      return { ...options, expires: match[2].toLowerCase() === "h" ? amount / 24 : amount };
    }
  }
  return options;
};

const cookie = {
  get(name) {
    return Cookies.get(name);
  },
  set(name, value, options = {}) {
    if (options.expires === 0 || value === undefined || value === null || value === "") {
      Cookies.remove(name);
      return;
    }
    Cookies.set(name, value, toJsCookieOptions(options));
  },
  delete(name) {
    Cookies.remove(name);
  },
};

export default {
  install(app) {
    app.config.globalProperties.$cookie = cookie;
  },
};

export { cookie };
