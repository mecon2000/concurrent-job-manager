// Increase timeout for tests that involve waiting for jobs
jest.setTimeout(30000);

// Suppress console output during tests
global.console = {
  ...console,
  log: jest.fn((...args) => {
    // Allow console.log to work in tests
    process.stdout.write(args.join(' ') + '\n');
  }),
  error: jest.fn((...args) => {
    // Allow console.error to work in tests
    process.stderr.write(args.join(' ') + '\n');
  }),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

console.log('Test setup file loaded'); 