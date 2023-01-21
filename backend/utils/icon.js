const { fetch } = require("cross-fetch");
const Cache = require("node-cache");
const { NOTION_URL, headers } = require("../constants");

const cache = new Cache({
  stdTTL: 60 * 60 * 24,
  checkperiod: 60 * 60 * 24,
});

const image2DataUri = (data, mediaType) => {
  if (!data || !mediaType) {
    // console.log("ImageDataURI :: Error :: Missing some of the required params: data, mediaType");
    return null;
  }

  mediaType = /\//.test(mediaType) ? mediaType : "image/" + mediaType;
  // @ts-ignore
  let dataBase64 = Buffer.isBuffer(data)
    ? data.toString("base64")
    : // @ts-ignore
      Buffer.from(data).toString("base64");
  let dataImgBase64 = "data:" + mediaType + ";base64," + dataBase64;

  return dataImgBase64;
};

const getNotionImage = async (imageURL, cookie) => {
  if (!imageURL) return null;

  const response = await fetch(imageURL, {
    headers: headers(cookie),
  });
  const contentType = response.headers.get("content-type");
  if (!contentType || contentType === "application/xml") {
    console.error("Notion Image not found", imageURL, contentType);
    return null;
  }
  const dataURI = image2DataUri(await response.arrayBuffer(), contentType);
  // console.log(`🚀 ~ file: icon.js:41 ~ getNotionImage ~ dataURI`, dataURI);

  cache.set(imageURL, dataURI);
  return dataURI;
};

const getIcon = async (icon, config) => {
  if (!icon) return null;
  icon = icon.trim();

  // Cache hit
  if (cache.has(icon)) {
    // console.log("Cache hit for icon", icon);
    return cache.get(icon);
  }
  // Internal Icons
  if (icon.startsWith("/icons")) {
    icon = NOTION_URL + icon;
  }
  // External Icons
  if (icon.startsWith("http")) {
    // console.log("Fetching icon", icon);
    const dataUri = await getNotionImage(icon, config.cookie);
    if (dataUri) {
      cache.set(icon, dataUri);
    }
    return dataUri;
  }
  // Data URI
  if (icon.startsWith("data:image")) {
    cache.set(icon, icon);
    return icon;
  }
  return icon;
};

module.exports = getIcon;
