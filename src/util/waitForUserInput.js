const readline = require('readline');

const rl = readline.createInterface(process.stdin, process.stdout);

const waitForUserInput = async () =>
  new Promise((resolve) => {
    rl.prompt(true);
    rl.on('line', (input) => {
      rl.pause();
      resolve(input);
    });
  });

module.exports = waitForUserInput;
