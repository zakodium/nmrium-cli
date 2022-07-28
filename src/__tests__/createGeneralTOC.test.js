import { join } from 'path';
import { statSync } from 'fs';
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
  expect(sizes).toStrictEqual([269, 156, 294, 736, 412]);
});
