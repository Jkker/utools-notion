const dayjs = require('dayjs');
dayjs.extend(require('dayjs/plugin/relativeTime'));
dayjs.locale(require('dayjs/locale/zh-cn'));

const fetchJSON = require('./fetch');
const ERROR = require('./error');
const { SEARCH_API, RECENT_PAGE_API, notionHeaders } = require('../constants');

const DEBUG = false;

// Helper functions
const uuid2Id = (uuid) => uuid.replace(/-/g, '');

const getTextContent = (text) => {
  if (!text) {
    return '';
  } else if (Array.isArray(text)) {
    return (
      text?.reduce(
        (prev, current) =>
          prev + (current[0] !== '⁍' && current[0] !== '‣' ? current[0] : ''),
        ''
      ) ?? ''
    );
  } else {
    return text;
  }
};

const processResultItem = (id, recordMap, extraProps) => {
  const breadcrumbs = [];
  const block = recordMap.block[id].value.value ?? recordMap.block[id].value;
  const { name, iconEmoji, fullIconUrl, visitedAt, score } = extraProps ?? {};
  let title = name ?? getTextContent(block.properties?.title);
  let icon = iconEmoji ?? fullIconUrl ?? block.format?.page_icon;

  // DFS to get title, icon & breadcrumbs
  const stack = [block];

  while (stack.length) {
    const { parent_id, parent_table, format, collection_id, properties, type } =
      stack.pop();

    //* Get title (required) & icon (optional) if not provided by current block

    if (!title) {
      // block is a collection => get collection name & icon
      if (collection_id) {
        const collection_value =
          recordMap.collection[collection_id].value?.value ??
          recordMap.collection[collection_id].value;

        title = getTextContent(collection_value?.name);
        icon = collection_value?.icon;
      }
      // block is a page => get page title & icon
      if (parent_id && type === 'page' && properties?.title) {
        title = getTextContent(properties.title);
        if (format?.page_icon) icon = format.page_icon;
      }
    }

    //* Get breadcrumbs

    // parent is a space
    if (!parent_id || parent_table === 'space') break;

    // parent is a collection
    if (parent_table === 'collection') {
      const parent_collection =
        recordMap.collection[parent_id].value?.value ??
        recordMap.collection[parent_id].value;
      breadcrumbs.unshift(getTextContent(parent_collection.name));
      stack.push(parent_collection);
      continue;
    }

    // parent is a page
    const parent_block =
      recordMap.block[parent_id].value?.value ??
      recordMap.block[parent_id].value;
    if (parent_table === 'block' && parent_block.type === 'page') {
      breadcrumbs.unshift(getTextContent(parent_block.properties?.title));
      stack.push(parent_block);
      continue;
    }

    // default
    stack.push(parent_block);
  }

  if (!title) title = 'Untitled';

  const pageId = uuid2Id(id);

  const item = {
    title,
    icon,
    breadcrumbs,
    id: pageId,
  };

  if (visitedAt) item.visitedAt = visitedAt;
  if (score) item.score = score;

  return item;
};

const getRecentPageVisits = async (config) => {
  const { cookie, spaceId, userId } = config;

  if (!cookie || !spaceId) {
    throw new Error(ERROR.SETTING_NOT_FOUND);
  }
  if (DEBUG) console.time('getRecentPageVisits fetch');

  const data = await fetchJSON(RECENT_PAGE_API, {
    method: 'POST',
    headers: notionHeaders(config.cookie),
    body: JSON.stringify({
      userId,
      spaceId,
    }),
    redirect: 'follow',
  });
  if (DEBUG) console.timeEnd('getRecentPageVisits fetch');

  if (data.errorId)
    throw new Error(ERROR.RESPONSE, {
      cause: `${data.name}: ${data.message}`,
    });

  try {
    const { pages, recordMap } = data;
    if (!pages || !recordMap) return [];
    const now = dayjs();
    const result = pages?.map(
      ({ id, name, iconEmoji, fullIconUrl, visitedAt }) =>
        processResultItem(id, recordMap, {
          name,
          iconEmoji,
          fullIconUrl,
          visitedAt: now.to(dayjs(visitedAt)),
        })
    );
    return result;
  } catch (error) {
    throw new Error(ERROR.PARSE, {
      cause: error,
    });
  }
};

const search = async (query, config) => {
  const { cookie, spaceId, navigableBlockContentOnly } = config;

  if (!cookie || !spaceId) {
    ERROR.report(
      ERROR.SETTING_NOT_FOUND,
      [cookie, spaceId].filter((i) => !i).join(', ')
    );
    return [];
  }

  if (DEBUG) console.time('search fetch');
  const data = await fetchJSON(SEARCH_API, {
    method: 'POST',
    headers: notionHeaders(config.cookie),
    body: JSON.stringify({
      type: 'BlocksInSpace',
      query,
      spaceId,
      limit: 20,
      filters: {
        isDeletedOnly: false,
        excludeTemplates: false,
        isNavigableOnly: false,
        navigableBlockContentOnly,
        requireEditPermissions: false,
        includePublicPagesWithoutExplicitAccess: false,
        ancestors: [],
        createdBy: [],
        editedBy: [],
        lastEditedTime: {},
        createdTime: {},
        inTeams: [],
      },
      searchExperimentOverrides: {},
      sort: {
        field: 'relevance',
      },
      source: 'quick_find_input_change',
    }),
    redirect: 'follow',
  });

  if (DEBUG) console.timeEnd('search fetch');

  if (data.errorId)
    throw new Error(ERROR.RESPONSE, {
      cause: `${data.name}: ${data.message}`,
    });

  const { results, recordMap } = data;
  if (!results && results.length === 0) {
    return [];
  }
  try {
    const result = results?.map(({ id, score }) =>
      processResultItem(id, recordMap, { score })
    );
    return result;
  } catch (error) {
    throw new Error(ERROR.PARSE, {
      cause: error,
    });
  }
};

const getUserInfo = async (config) => {
  const { cookie, spaceId, userId } = config;

  if (!cookie || !spaceId) {
    throw new Error(ERROR.SETTING_NOT_FOUND);
  }

  if (DEBUG) console.time('userinfo fetch');

  const data = await fetchJSON('https://www.notion.so/api/v3/getSpaces', {
    method: 'POST',
    headers: notionHeaders(config.cookie),
  });

  if (DEBUG) console.timeEnd('userinfo fetch');

  if (data.errorId)
    throw new Error(ERROR.RESPONSE, {
      cause: `${data.name}: ${data.message}`,
    });

  if (userId !== Object.keys(data)[0]) {
    throw new Error(ERROR.RESPONSE, {
      cause: `userId in config "${userId}" does not match the userId of the user logged in "${
        data.keys()[0]
      }"`,
    });
  }
  try {
    const recordMap = data[userId];

    const userInfo = recordMap.notion_user[userId].value.value;

    const spaceViewId = recordMap.user_root[
      userId
    ].value.value.space_view_pointers.find(
      ({ id, spaceId: _spaceId }) => _spaceId === spaceId
    ).id;

    const bookmarks =
      recordMap.space_view[spaceViewId].value.value.bookmarked_pages?.map(
        (id) => processResultItem(id, recordMap)
      ) ?? [];

    return {
      ...userInfo,
      bookmarks,
    };
  } catch (error) {
    throw new Error(ERROR.PARSE, {
      cause: error,
    });
  }
};

module.exports = {
  getRecentPageVisits,
  search,
  getUserInfo,
  getTextContent,
  processResultItem,
};
