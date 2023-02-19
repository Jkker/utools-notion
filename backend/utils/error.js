const ERROR = {
  SETTING_NOT_FOUND: '未配置',
  SETTING_ERROR: '配置错误',
  COOKIE_INVALID: 'Cookie 无效',
  SPACE_ID_INVALID: 'INVALID_SPACE_ID',
  SPACE_ID_NOT_FOUND: 'Space ID 无效',
  USER_ID_NOT_FOUND: 'Cookie 中未找到 notion_user_id',
  RESULT_EMPTY: '搜索结果为空，或 Cookie 已过期',
  SEARCH_ERROR: '搜索失败',
  RECENT_ERROR: '获取最近浏览的页面失败',
  FETCH: '网络请求失败',
  RESPONSE: '请求成功，但服务器返回错误',
  PARSE: '解析失败',

  report: function (type, error) {
    console.error(type, error);
    if (error?.cause) {
      console.error(error.cause);
    }
    if (utools) utools.showNotification(error ? type + ': ' + error : type);
  },

  wrap: function (fn) {
    return async function (...args) {
      try {
        return await fn(...args);
      } catch (error) {
        // @ts-ignore
        ERROR.report(error.message, error.cause);
      }
    };
  },
};

module.exports = ERROR;
