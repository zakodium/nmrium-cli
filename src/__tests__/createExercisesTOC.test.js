import { statSync } from 'fs';
import { join } from 'path';

import readdir from 'recursive-readdir';
import { expect, test } from 'vitest';

import { createExercisesTOC } from '../commands/createExercisesTOC.js';

test('createExercisesTOC', async () => {
  const dataDir = join(__dirname, 'exercises');
  await createExercisesTOC(__dirname, {
    dataDir,
    appendNoStereoIDCodeHash: true,
  });

  const files = (await readdir(dataDir)).sort();
  const sizes = files
    .filter((file) => file.match(/\.json$/))
    .map((file) => {
      return statSync(file).size;
    });
  expect(sizes).toStrictEqual([138, 257, 138, 258, 1053, 412]);
});

test('createExercisesTOC with predicted', async () => {
  const dataDir = join(__dirname, 'acdPrediction');
  await createExercisesTOC(__dirname, {
    dataDir,
    appendIDCode: true,

    cleanJCAMP: true,
  });

  const files = (await readdir(dataDir)).sort();
  const sizes = files
    .filter((file) => file.match(/\.json$/))
    .map((file) => {
      return statSync(file).size;
    });
  expect(sizes).toStrictEqual([138, 138, 138, 665]);
});
