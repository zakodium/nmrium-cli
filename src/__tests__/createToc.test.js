import { join } from 'path';

import { createToc } from '../toc/createToc';

test('createToc', () => {
  createToc(__dirname, { dataDir: join(__dirname, 'data') });
});
