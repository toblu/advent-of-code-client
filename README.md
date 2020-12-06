# advent-of-code-client

A NodeJS client for fetching inputs, running puzzle challenges and submitting answers to Advent Of Code directly from your JavaScript code.

## Installation

```
npm i --save advent-of-code-client
```

## How to use

Initializing the client:

```javascript
const AocClient = require('advent-of-code-client');

const client = new AocClient({
  year: 2020, // the year of the challenge
  day: 1, // the day of the challenge
  token: 'MY_SESSION_COOKIE' // the session cookie from adventofcode.com
});
```

Fetching the puzzle input:

```javascript
const input = await client.getInput();
```

Submitting answer to a part of the puzzle, in this example part 1:

```javascript
const success = await client.submit(1, myAnswer);
```

Automatically running the puzzle parts and submitting the answers:

```javascript
const part1 = (input) => {
  // ...do part 1
  return answer;
};

const part2 = (input) => {
  // ...do part 2
  return answer;
};

// true as the second argument means that the answers returned from each part will be automatically submitted
await client.run([part1, part2], true);
```

Transforming inputs before they are returned from `.getInput()`. This can be especially useful if you are running your puzzle parts automatically. When using the `.setInputTransform(transform)` method, the input to each part function will be the transformed / parsed data.

For convenience there are a couple of pre-defined transform functions for commonly used transformations (i.e. splitting data by lines). The pre-defined transform functions are exported as `transforms`:

```javascript
const { transforms } = require('advent-of-code-client');

client.setInputTransform(transforms.lines);
```

You can also specify your own transform function:

```javascript

const myTransform = rawData => {
  ... // transform data
  return transformedData;
}

client.setInputTransform(myTransform);
```

## Authentication

To be able to fetch inputs and submit answers, you must authenticate against adventofcode.com using the value from your session cookie. You can find it among your browser cookies. Pass it in as the value for the `token` attribute when you initialize the client.

## Caching

To prevent unnecessary load on advent-of-code servers, all the requests are cached. So if you for example have previously submitted an incorrect answer and try to submit the same answer again, the client will just return the cached response instead of calling adventofcode.com again.

If you for some reason need to prevent the client from using the cache, you should set the `useCache` to false when initializing the client (use with caution).

```javascript
const client = new AocClient({
  ..., // other options
  useCache: false
})
```

## Disclaimer

This is not an official tool for Advent Of Code and I am not in any way affiliated or in cooperation with adventofcode.com. I am a happy user who myself participate in the Advent Of Code challenges, and I wanted to make a tool that would help with fetching inputs and submitting answers.

I wrote this tool over a weekend so I can basically guarantee that it contains some bugs :) Please keep that in mind in case you decide to use it.
