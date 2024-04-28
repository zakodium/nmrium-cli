/* eslint-disable no-console */
import { join } from 'path';

import { expect, test } from 'vitest';

import { createMolfilesFromFiles } from '../commands/createMolfilesFromFiles.js';

test('more than one .txt file found', async () => {
  const originalConsoleLog = console.log;
  const logs = [];
  console.log = (message) => logs.push(message);

  await createMolfilesFromFiles(__dirname, {
    dataDir: join(__dirname, 'smiles/many'),
  });
  expect(logs[0]).toContain(['more than one file with .txt extension found']);
  expect(logs[1]).toContain(['no file with .sdf extension found']);
  console.log = originalConsoleLog;
});

test('no .txt file', async () => {
  const originalConsoleLog = console.log;
  const logs = [];
  console.log = (message) => logs.push(message);

  await createMolfilesFromFiles(__dirname, {
    dataDir: join(__dirname, 'smiles/none'),
  });
  expect(logs[0]).toContain(['no file with .txt extension found']);
  expect(logs[1]).toContain(['no file with .sdf extension found']);
  console.log = originalConsoleLog;
});

test('one .txt file', async () => {
  const originalConsoleLog = console.log;
  const logs = [];
  console.log = (message) => logs.push(message);

  await createMolfilesFromFiles(__dirname, {
    dataDir: join(__dirname, 'smiles/one'),
  });
  expect(logs).toHaveLength(1);
  expect(logs[0]).toContain(['already contains folder 01']);
  console.log = originalConsoleLog;
});
