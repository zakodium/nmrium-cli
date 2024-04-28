import { statSync } from 'fs';
import { join } from 'path';

import readdir from 'recursive-readdir';
import { expect, test } from 'vitest';

import { createGeneralTOC } from '../commands/createGeneralTOC.js';

const dataDir = join(__dirname, 'general');

test('createGeneralTOC', async () => {
  await createGeneralTOC(__dirname, { dataDir });

  const files = (await readdir(dataDir))
    .sort()
    .filter((file) => file.match(/\.json$/));

  const sizes = files.map((file) => {
    return statSync(file).size;
  });
  expect(sizes).toStrictEqual([1656, 832, 1127, 96, 487, 250]);
});
