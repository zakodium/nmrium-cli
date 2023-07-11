import { createToc } from './toc/createToc';
import { processExerciseFolder } from './toc/processExerciseFolder';

/**
 * Add the links based on all the available toc files
 * @param {string} commandDir
 * @param {object} [options={}]
 * @param {string} [options.dataDir]
 */
export async function createExercisesTOC(commandDir, options = {}) {
  return createToc(commandDir, processExerciseFolder, options);
}
