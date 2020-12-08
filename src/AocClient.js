const { getYear } = require('date-fns');
const Cache = require('cache-conf');
const emojic = require('emojic');
const { getInput, postAnswer } = require('./util/api');
const logger = require('./util/logger');
const waitForUserInput = require('./util/waitForUserInput');

const getCacheKey = ({ year, day, token, part }) =>
  `${year}:${day}:${token}:${part}`;

/**
 * A class that handles fetching input from and submitting answers to Advent Of Code.
 * Each instance of the class corresponds to a puzzle for a specific day and year based on the configuration.
 */
class AocClient {
  /**
   * @param {object} config
   */
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
    this.transform = null;
  }

  _hasCompletedPart(part) {
    const cacheKey = getCacheKey({ ...this.config, part });
    return this.cache.get(cacheKey) === true;
  }

  _markCompletedPart(part) {
    const cacheKey = getCacheKey({ ...this.config, part });
    this.cache.set(cacheKey, true);
  }

  /**
   * Get the input for the puzzle.
   * @return the puzzle input. If a transform function has been set using the ´setInputTransform´ method it will return the transformed input, otherwise the raw input is returned.
   */
  async getInput() {
    logger.log('Fetching input...');
    const input = await getInput(this.config, this.cache);
    const trimmedInput = input.trim();
    return this.transform ? this.transform(trimmedInput) : trimmedInput;
  }

  /**
   * Submit puzzle answer for a specific part of the puzzle. If the part of the puzzle has already been completed, it will not be submitted again.
   * @param {number} part - the part of the puzzle that the answer is for (should be 1 or 2).
   * @param {any} answer - the answer to the puzzle.
   * @return {boolean} true if the answer was correct, false otherwise.
   */
  async submit(part, answer) {
    if (part !== 1 && part !== 2) {
      return Promise.reject(new Error('Part must be either 1 or 2'));
    }

    logger.log(`Submitting part ${part}...`);

    if (part === 1 && this._hasCompletedPart(1)) {
      logger.success('Part 1 already completed');
      return Promise.resolve(true);
    }
    if (part === 2 && this._hasCompletedPart(2)) {
      logger.success(
        'Part 2 already completed successfully, continue with next puzzle'
      );
      return Promise.resolve(true);
    }

    const { correct } = await postAnswer(
      { part, answer },
      this.config,
      this.cache
    );

    if (correct) {
      this._markCompletedPart(part);
    }

    const resultLogger = correct ? logger.success : logger.fail;
    resultLogger(`Result: ${answer}`);

    if (part === 2 && correct) {
      console.log();
      logger.log("All done! Great job, here's a cookie", emojic.cookie);
    }

    return correct;
  }

  /**
   * Run the puzzle parts (it can run either only part 1 or part 1 and 2) and submit the answers. A part that has previously been completed successfully will not run again.
   * @param {array} parts - an array with length of either 1 or 2. Each element in the array must be a function that takes the puzzle input and returns the calculated puzzle answer. The first element in the array corresponds to part 1 of the puzzle, and the second element (if specified) corresponds to part 2 of the puzzle.
   * @param {boolean} autoSubmit - when true the answers for each part will be submitted to Advent Of Code automatically, otherwise each answer will require confirmation before it will be submitted.
   */
  async run(parts, autoSubmit = false) {
    if (!parts || !parts.length || parts.length > 2) {
      return Promise.reject(
        new Error('Parts must be an array with length between 1 and 2')
      );
    }

    if (
      typeof parts[0] !== 'function' ||
      (parts[1] !== undefined && typeof parts[1] !== 'function')
    ) {
      return Promise.reject(
        new Error('All elements in the parts array must be of type function')
      );
    }

    if (this._hasCompletedPart(1) && this._hasCompletedPart(2)) {
      logger.log(
        'Both parts already completed successfully, continue with next puzzle',
        emojic.star,
        emojic.star
      );
      return Promise.resolve();
    }

    if (
      parts.length === 1 &&
      this._hasCompletedPart(1) &&
      !this._hasCompletedPart(2)
    ) {
      logger.log(
        'Part 1 already completed successfully, continue with part 2',
        emojic.star
      );
      return Promise.resolve();
    }

    const input = await this.getInput();
    const results = [undefined, undefined];
    if (!this._hasCompletedPart(1)) {
      results[0] = parts[0](input);
    } else {
      logger.success('Part 1 already completed');
    }
    if (!this._hasCompletedPart(2) && parts.length === 2) {
      results[1] = parts[1](input);
    }

    if (autoSubmit) {
      logger.log('Submitting answers automatically');
      if (results[0] !== undefined) {
        await this.submit(1, results[0]);
      }
      if (results[1] !== undefined) {
        await this.submit(2, results[1]);
      }
      return Promise.resolve();
    }
    if (results[0] !== undefined) {
      logger.log('Your result from part 1 is', results[0]);
      logger.log('Do you want to submit it? (Y/N):');
      const userInput = await waitForUserInput();
      if (userInput.toLowerCase() !== 'y') return Promise.resolve();
      await this.submit(1, results[0]);
    }
    if (results[1] !== undefined) {
      logger.log('Your result from part 2 is', results[1]);
      logger.log('Do you want to submit it? (Y/N):');
      const userInput = await waitForUserInput();
      if (userInput.toLowerCase() !== 'y') return Promise.resolve();
      await this.submit(2, results[1]);
    }
    return Promise.resolve();
  }

  setInputTransform(transform) {
    if (typeof transform !== 'function')
      throw new Error('transform must be a function');
    this.transform = transform;
  }
}

module.exports = AocClient;
