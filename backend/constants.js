const NOTION_URL = 'https://www.notion.so';
const DESKTOP_URL = 'notion://www.notion.so';
const NOTION_API_URL = 'https://www.notion.so/api/v3';
const RECENT_PAGE_API = `${NOTION_API_URL}/getRecentPageVisits`;
const SEARCH_API = `${NOTION_API_URL}/search`;

const DEFAULT_HEADERS = {
  accept: '*/*',
  'Content-Type': 'application/json',
  'accept-language': 'en-US,en;q=0.9',
  'notion-audit-log-platform': 'web',
  'notion-client-version': '23.11.0.8',
  'sec-ch-ua':
    '"Not?A_Brand";v="8", "Chromium";v="108", "Microsoft Edge";v="108"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.54',
};

const notionHeaders = (cookie) =>
  new Headers({
    ...DEFAULT_HEADERS,
    origin: NOTION_URL,
    Referer: NOTION_URL,
    cookie,
  });

module.exports = {
  NOTION_URL,
  NOTION_API_URL,
  DESKTOP_URL,
  SEARCH_API,
  RECENT_PAGE_API,
  notionHeaders,
  DEFAULT_HEADERS,
};
