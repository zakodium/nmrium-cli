import { join } from 'path';
import { statSync } from 'fs';
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
  expect(sizes).toStrictEqual([269, 156, 294, 736, 412]);
});
