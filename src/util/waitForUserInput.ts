import readline from 'readline';

const rl = readline.createInterface(process.stdin, process.stdout);

const waitForUserInput = async (): Promise<string> =>
  new Promise((resolve) => {
    rl.prompt(true);
    rl.on('line', (input: string) => {
      rl.pause();
      resolve(input);
    });
  });

export default waitForUserInput;
