const { fetch } = require('cross-fetch');
const fetchJSON = (...args) =>
  fetch(...args)
    .catch((error) => {
      throw new Error(ERROR.FETCH, {
        cause: error,
      });
    })
    .then((response) => response.json());

module.exports = fetchJSON;
