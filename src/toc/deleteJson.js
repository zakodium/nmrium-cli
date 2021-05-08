import { unlinkSync } from 'fs';

import dir from 'fs-readdir-recursive';

/**
 * Create toc.json for the full project
 * @param {string} commandDir
 * @param {object} [options={}]
 * @param {boolean} [options.dataDir]
 */
export function deleteJson(commandDir, options = {}) {
  const { dataDir = commandDir } = options;
  const files = dir(dataDir).filter((file) => file.endsWith('.json'));
  for (let file of files) {
    unlinkSync(file);
  }
}
