/* eslint-disable no-console */
import { join } from 'path';

import { expect, test } from 'vitest';

import { predictSpectra } from '../commands/predictSpectra.js';

const dataDir = join(__dirname, 'toPredict');

test('predictSpectra', async () => {
  const originalConsoleLog = console.log;
  const logs = [];
  console.log = (message) => logs.push(message);
  await predictSpectra(__dirname, { dataDir });
  expect(logs.filter((log) => log.includes('labile'))).toHaveLength(1);
  expect(logs.filter((log) => log.includes('Skipping'))).toHaveLength(5);
  console.log = originalConsoleLog;
});
