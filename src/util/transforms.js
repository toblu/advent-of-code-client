/**
 * Splits the data by line breaks.
 * @param {string} data
 */
const lines = (data) => data.split('\n');

/**
 * Splits the data by line breaks and parses string values into numbers.
 * @param {string} data
 */
const numbers = (data) => lines(data).map((value) => +value);

/**
 * Splits the data by a custom separator.
 * @param {string | RegExp} separator - the custom separator
 * @returns { (data: string) => string[] }
 */
const splitBy = (separator) => (data) => data.split(separator);

module.exports = {
  lines,
  numbers,
  splitBy
};
