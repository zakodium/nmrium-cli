import {
  lstatSync,
  existsSync,
  readFileSync,
  readdirSync,
  unlinkSync,
} from 'fs';
import { join } from 'path';

import Debug from 'debug';
import dir from 'fs-readdir-recursive';
import YAML from 'yaml';

import { processExerciseFolder } from './processExerciseFolder';
import writeTocs from './utils/writeTocs';

const debug = Debug('Create toc');

/**
 * Create toc.json for the full project
 * @param {string} commandDir
 * @param {object} [options={}]
 * @param {boolean} [options.clean] Remove all the json files from the data directory
 * @param {boolean} [options.nostructure] Remove the structure from the result
 */
export function createToc(commandDir, options = {}) {
  const { noStructure, dataDir = commandDir } = options;

  let toc = [];
  processFolder(dataDir, '.', toc);

  debug(`Save: ${join(dataDir, 'toc.json')}`);
  writeTocs(dataDir, toc);
}

function processFolder(basename, folder, toc) {
  debug('Processing folder: ', basename, folder);
  const currentFolder = join(basename, folder);
  const entries = readdirSync(currentFolder);

  const folders = entries.filter(
    (file) =>
      !file.startsWith('.') &&
      lstatSync(join(currentFolder, file)).isDirectory(),
  );
  for (let subfolder of folders) {
    if (existsSync(join(currentFolder, subfolder, 'structure.mol'))) {
      processExerciseFolder(basename, join(folder, subfolder), toc);
    } else {
      const folderConfigFilename = join(currentFolder, subfolder, 'index.yml');
      const folderConfig = existsSync(folderConfigFilename)
        ? YAML.parse(readFileSync(folderConfigFilename, 'utf8'))
        : {};
      const subtoc = {
        groupName: folderConfig.menuLabel || subfolder.replace(/^[0-9]*_/, ''),
        folderName: subfolder,
        children: [],
      };
      toc.push(subtoc);
      processFolder(basename, join(folder, subfolder), subtoc.children);
    }
  }
}
