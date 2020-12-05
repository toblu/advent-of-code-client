const fetch = require('node-fetch');
const pkg = require('../../package.json');
const logger = require('./logger');

const HOST_URI = 'https://adventofcode.com';
const USER_AGENT = `node/${process.version} ${pkg.name}/${pkg.version}`;

const TOO_EARLY_REQUEST_TEXT =
  "please don't repeatedly request this endpoint before it unlocks";
const CORRECT_ANSWER_TEXT = "that's the right answer";
const INCORRECT_ANSWER_TEXT = "that's not the right answer";
const TOO_RECENT_ANSWER_TEXT =
  'you gave an answer too recently; you have to wait after submitting an answer before trying again.';
const ALREADY_COMPLETED_ANSWER_TEXT =
  "you don't seem to be solving the right level";

const fetchFromCacheOrAoC = async (cacheKey, uri, options, config, cache) => {
  if (config.useCache) {
    const cachedResponse = cache.get(cacheKey);
    // use the cached response response if it exists
    if (cachedResponse) {
      logger.debug(
        'Found a previously cached response, returning response from cache'
      );
      return Promise.resolve(cachedResponse);
    }
  }
  // otherwise call AoC
  logger.debug(
    'No previously cached response found, fetching from Advent Of Code'
  );
  const response = await fetch(uri, options);
  return response.text();
};

async function getInput(config, cache) {
  const { year, day, token } = config;
  const uri = `${HOST_URI}/${year}/day/${day}/input`;
  const options = {
    method: 'get',
    headers: {
      'Content-Type': 'text/plain',
      Cookie: `session=${token}`,
      'User-Agent': USER_AGENT
    }
  };

  const cacheKey = JSON.stringify({
    uri,
    token
  });

  const textResponse = await fetchFromCacheOrAoC(
    cacheKey,
    uri,
    options,
    config,
    cache
  );

  if (textResponse.toLowerCase().includes(TOO_EARLY_REQUEST_TEXT)) {
    return Promise.reject(
      new Error(
        'This puzzle has not opened yet, please wait until the puzzle unlocks!'
      )
    );
  }

  const isValidInputResponse =
    textResponse.length && !textResponse.match(/<[^>]+>/);

  if (!isValidInputResponse) {
    return Promise.reject(
      new Error(
        'An error occurred while fetching the input. Are you authenticated correctly?'
      )
    );
  }

  if (config.useCache && !cache.get(cacheKey)) {
    // update cache if it had not been set previously
    cache.set(cacheKey, textResponse);
  }
  return textResponse;
}

const postAnswer = async ({ part, answer }, config, cache) => {
  const { year, day, token } = config;
  const uri = `${HOST_URI}/${year}/day/${day}/answer`;
  const options = {
    method: 'post',
    headers: {
      Cookie: `session=${token}`,
      'User-Agent': USER_AGENT,
      'cache-control': 'no-cache',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      level: part,
      answer
    })
  };
  const cacheKey = JSON.stringify({
    uri,
    token,
    part,
    answer
  });
  const cachedResponse = cache.get(cacheKey);

  const textResponse = await fetchFromCacheOrAoC(
    cacheKey,
    uri,
    options,
    config,
    cache
  );

  const text = textResponse.toLowerCase();
  if (
    text.includes(CORRECT_ANSWER_TEXT) ||
    text.includes(ALREADY_COMPLETED_ANSWER_TEXT)
  ) {
    if (config.useCache && !cachedResponse) {
      // Update cache if no previously cached response
      cache.set(cacheKey, textResponse);
    }
    return Promise.resolve({ correct: true });
  }
  if (text.includes(INCORRECT_ANSWER_TEXT)) {
    if (config.useCache && !cachedResponse) {
      // Update cache if no previously cached response
      cache.set(cacheKey, textResponse);
    }
    return Promise.resolve({ correct: false });
  }
  if (text.includes(TOO_RECENT_ANSWER_TEXT)) {
    const leftToWaitText = text
      .split(TOO_RECENT_ANSWER_TEXT)[1]
      .split('.')[0]
      .trim();
    return Promise.reject(
      new Error(`You gave an answer too recently, ${leftToWaitText}.`)
    );
  }
  if (text.includes(TOO_EARLY_REQUEST_TEXT)) {
    return Promise.reject(
      new Error(
        'This puzzle has not opened yet, please wait until the puzzle unlocks!'
      )
    );
  }
  return Promise.reject(
    new Error('Unknown response from AoC. Are you authenticated correctly?')
  );
};

module.exports = {
  getInput,
  postAnswer
};
