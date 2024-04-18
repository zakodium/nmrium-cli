import { createToc } from './toc/createToc.js';
import { processExerciseFolder } from './toc/processExerciseFolder.js';

/**
 * Add the links based on all the available toc files
 * @param {string} commandDir
 * @param {object} [options={}]
 * @param {string} [options.dataDir]
 * @param {boolean} [options.keepIdCode] - kepp idCode in the answer to be able to provide tips
 * @param {boolean} [options.cleanJCAMP] - keep only the spectrum in the JCAMP-DX
 */
export async function createExercisesTOC(commandDir, options = {}) {
  return createToc(commandDir, processExerciseFolder, options);
}
