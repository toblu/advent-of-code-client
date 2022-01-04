const emojic = require('emojic');

const prefix = '[advent-of-code-client]';

const logger = {
  log: (...args: any[]) => console.log(prefix, ...args),
  debug: (...args: any[]) => {
    if (process.env.AOC_DEBUG === 'true' || globalThis.aocDebug) {
      console.debug(prefix, ...args);
    }
  },
  error: (...args: any[]) => console.error(prefix, ...args),
  success: (...args: any[]) => logger.log(...args, emojic.whiteCheckMark),
  fail: (...args: []) => logger.log(...args, emojic.x)
};

export default logger;
