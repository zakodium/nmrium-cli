import { join } from 'path';

import { expect, test } from 'vitest';

import { predictSpectra } from '../commands/predictSpectra.js';

const dataDir = join(__dirname, 'toPredict');

test('predictSpectra', async () => {
  await predictSpectra(__dirname, { dataDir });
});
