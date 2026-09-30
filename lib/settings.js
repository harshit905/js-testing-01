// INI settings (ini) and a cookie jar (tough-cookie): both stable APIs across their fix windows.
const ini = require("ini");
const tough = require("tough-cookie");

function parseSettings(text) {
  return ini.parse(text);
}

function jarWith(cookieLine, url) {
  const jar = new tough.CookieJar();
  jar.setCookieSync(cookieLine, url);
  return jar.getCookieStringSync(url);
}

module.exports = { parseSettings, jarWith };
