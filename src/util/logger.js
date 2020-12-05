const emojic = require('emojic');

const prefix = '[advent-of-code-client]';

const logger = {
  log: (...args) => console.log(prefix, ...args),
  debug: (...args) => {
    if (process.env.AOC_DEBUG === 'true' || globalThis.aocDebug) {
      console.debug(prefix, ...args);
    }
  },
  error: (...args) => console.error(prefix, ...args),
  success: (...args) => logger.log(...args, emojic.whiteCheckMark),
  fail: (...args) => logger.log(...args, emojic.x)
};

module.exports = logger;
