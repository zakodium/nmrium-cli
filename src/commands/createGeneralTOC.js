import { createToc } from './toc/createToc.js';
import { processGeneralFolder } from './toc/processGeneralFolder.js';

/**
 * Add the links based on all the available toc files
 * @param {string} commandDir
 * @param {object} [options={}]
 * @param {boolean} [options.dataDir]
 */
export async function createGeneralTOC(commandDir, options = {}) {
  return createToc(commandDir, processGeneralFolder, options);
}
