import { unlinkSync } from 'fs';

import dir from 'fs-readdir-recursive';

/**
 * Delete all 'structure.mol' files
 * @param {string} commandDir
 * @param {object} [options={}]
 * @param {boolean} [options.dataDir]
 */
export function deleteStructures(commandDir, options = {}) {
  const { dataDir = commandDir } = options;
  const files = dir(dataDir).filter((file) => file.endsWith('structure.mol'));
  for (let file of files) {
    unlinkSync(file);
  }
}
