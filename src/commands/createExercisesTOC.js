import { createToc } from './toc/createToc';
import { processExerciseFolder } from './toc/processExerciseFolder';

/**
 * Add the links based on all the available toc files
 * @param {string} commandDir
 * @param {object} [options={}]
 * @param {boolean} [options.dataDir]
 */
export async function createExercisesTOC(commandDir, options = {}) {
  createToc(commandDir, processExerciseFolder, options);
}
