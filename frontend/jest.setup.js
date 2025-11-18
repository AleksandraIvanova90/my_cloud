import '@testing-library/jest-dom';

if (typeof global.TextEncoder === 'undefined') {
  // eslint-disable-next-line import/no-nodejs-modules
  const { TextEncoder } = require('util');
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  // eslint-disable-next-line import/no-nodejs-modules
  const { TextDecoder } = require('util');
  global.TextDecoder = TextDecoder;
}
