import { statSync } from 'fs';
import { join } from 'path';

import readdir from 'recursive-readdir';

import { createExercisesTOC } from '../commands/createExercisesTOC';

const dataDir = join(__dirname, 'exercises');

test('createExercisesTOC', async () => {
  await createExercisesTOC(__dirname, { dataDir });

  const files = (await readdir(dataDir)).sort();
  const sizes = files
    .filter((file) => file.match(/\.json$/))
    .map((file) => {
      return statSync(file).size;
    });
  expect(sizes).toStrictEqual([279, 156, 294, 746, 412]);
});
