const { getYear } = require('date-fns');
const Cache = require('cache-conf');
const emojic = require('emojic');
const { getInput, postAnswer } = require('./util/api');
const logger = require('./util/logger');

class AocClient {
  constructor({ year, day, token, useCache = true, debug = false }) {
    if (
      !year ||
      Number.isNaN(year) ||
      year < 2015 ||
      year > getYear(new Date())
    ) {
      throw new Error(
        'Missing or invalid year option, year must be a number between 2015 and current year'
      );
    }
    if (!day || Number.isNaN(day) || day < 1 || day > 25) {
      throw new Error(
        'Missing or invalid day option, day must be a number between 1 and 25'
      );
    }
    if (!token || typeof token !== 'string') {
      throw new Error('Missing or invalid token option');
    }

    if (typeof useCache !== 'boolean') {
      throw new Error('Invalid useCache option, useCache can only be boolean');
    }

    if (typeof debug !== 'boolean') {
      throw new Error('Invalid debug option, debug can only be boolean');
    }
    this.config = {
      year,
      day,
      token,
      useCache
    };
    if (debug) {
      globalThis.aocDebug = true;
    }
    this.cache = new Cache();
  }

  async getInput(separator) {
    if (
      separator !== undefined &&
      typeof separator !== 'string' &&
      separator instanceof RegExp !== true
    ) {
      return Promise.reject(
        new Error('separator must be of either type string or RegExp')
      );
    }
    logger.log('Fetching input...');
    const input = await getInput(this.config, this.cache);
    const trimmedInput = input.trim();
    return separator ? trimmedInput.split(separator) : trimmedInput;
  }

  async submit(part, answer) {
    if (part !== 1 && part !== 2) {
      return Promise.reject(new Error('Part must be either 1 or 2'));
    }

    logger.log(`Submitting part ${part}...`);

    const { correct } = await postAnswer(
      { part, answer },
      this.config,
      this.cache
    );

    const resultLogger = correct ? logger.success : logger.fail;

    resultLogger(`Result: ${answer}`);

    if (part === 2 && correct) {
      console.log();
      logger.log("All done! Great job, here's a cookie", emojic.cookie);
    }

    return { correct };
  }

  getCachePath() {
    return this.cache.path();
  }
}

module.exports = AocClient;
