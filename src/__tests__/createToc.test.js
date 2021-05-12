import { join } from 'path';

import { createExercisesTOC } from '../commands/createExercisesTOC';

test('createToc', async () => {
  await createExercisesTOC(__dirname, { dataDir: join(__dirname, 'data') });
});
