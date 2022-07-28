import { statSync } from 'fs';
import { join } from 'path';

import readdir from 'recursive-readdir';

import { createGeneralTOC } from '../commands/createGeneralTOC';

const dataDir = join(__dirname, 'general');

test('createGeneralTOC', async () => {
  await createGeneralTOC(__dirname, { dataDir });

  const files = (await readdir(dataDir)).sort();
  const sizes = files
    .filter((file) => file.match(/\.json$/))
    .map((file) => {
      return statSync(file).size;
    });
  expect(sizes).toStrictEqual([2115, 422, 826, 503, 268]);
});
