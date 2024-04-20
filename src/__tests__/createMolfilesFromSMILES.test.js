/* eslint-disable no-console */
import { join } from 'path';

import { expect, test } from 'vitest';

import { createMolfilesFromSMILES } from '../commands/createMolfilesFromSMILES.js';

test('more than one .txt file found', async () => {
  const originalConsoleLog = console.log;
  const logs = [];
  console.log = (message) => logs.push(message);

  await createMolfilesFromSMILES(__dirname, {
    dataDir: join(__dirname, 'smiles/many'),
  });
  expect(logs).toStrictEqual(['More than one file with .txt extension found']);
  console.log = originalConsoleLog;
});

test('no .txt file', async () => {
  const originalConsoleLog = console.log;
  const logs = [];
  console.log = (message) => logs.push(message);

  await createMolfilesFromSMILES(__dirname, {
    dataDir: join(__dirname, 'smiles/none'),
  });
  expect(logs).toStrictEqual(['No file with .txt extension found']);
  console.log = originalConsoleLog;
});

test('one .txt file', async () => {
  const originalConsoleLog = console.log;
  const logs = [];
  console.log = (message) => logs.push(message);

  await createMolfilesFromSMILES(__dirname, {
    dataDir: join(__dirname, 'smiles/one'),
  });
  expect(logs).toHaveLength(3);
  console.log = originalConsoleLog;
});
