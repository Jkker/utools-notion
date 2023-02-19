const { search, getRecentPageVisits, getUserInfo } = require('./utils/notion');
const ERROR = require('./utils/error');
const { getIcon, clearIconCache } = require('./utils/icon');

Object.defineProperty(window, 'getRecentPageVisits', {
  value: ERROR.wrap(getRecentPageVisits),
  writable: false,
});

Object.defineProperty(window, 'search', {
  value: ERROR.wrap(search),
  writable: false,
});

Object.defineProperty(window, 'getUserInfo', {
  value: ERROR.wrap(getUserInfo),
  writable: false,
});

Object.defineProperty(window, 'getIcon', {
  value: ERROR.wrap(getIcon),
  writable: false,
});
Object.defineProperty(window, 'clearIconCache', {
  value: clearIconCache,
  writable: false,
});
