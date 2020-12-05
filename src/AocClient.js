const { getYear } = require('date-fns');
const Cache = require('cache-conf');
const { getInput, postAnswer } = require('./util/api');

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
      useCache,
      debug
    };
    this.cache = new Cache();
  }

  getInput() {
    return getInput(this.config, this.cache);
  }

  submit(part, answer) {
    return postAnswer({ part, answer }, this.config, this.cache);
  }

  getCachePath() {
    return this.cache.path();
  }
}

module.exports = AocClient;
