/**
 * Formats API responses uniformly.
 * @param {boolean} success 
 * @param {any} data 
 * @param {any} error 
 * @returns {object} API payload
 */
const formatResponse = (success, data = null, error = null) => {
  return {
    success,
    data,
    error
  };
};

module.exports = {
  formatResponse
};
