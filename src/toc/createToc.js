import {
  lstatSync,
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync,
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
 * @param {string} dataDir
 * @param {options} folder
 * @param {object} toc
 */
export function createToc(dataDir, options = {}) {
  if (options.clean) {
    const files = dir(dataDir).filter((file) => file.endsWith('.json'));
    for (let file of files) {
      unlinkSync(file);
    }
  }

  let toc = [];
  processFolder(dataDir, '.', toc);

  if (options.nostructure) {
    const files = dir(dataDir).filter((file) => file.endsWith('structure.mol'));
    for (let file of files) {
      unlinkSync(file);
    }
  }

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
