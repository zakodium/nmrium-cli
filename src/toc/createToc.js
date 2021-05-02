import {
  lstatSync,
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';

import Debug from 'debug';
import YAML from 'yaml';

import { processExerciseFolder } from './processExerciseFolder';

const debug = Debug('Create toc');

const DATA_FOLDER = '.';

export function createToc(options = {}) {
  const { homeDir } = options;
  const DATA_DIR = join(homeDir, DATA_FOLDER);
  let toc = [];
  processFolder(join(homeDir, DATA_FOLDER), '.', toc);

  writeFileSync(
    join(DATA_DIR, 'toc.json'),
    JSON.stringify(toc, undefined, 2),
    'utf8',
  );
  for (let item of toc) {
    if (!item.folderName || !item.children || item.children.length < 1) {
      continue;
    }
    const subToc = JSON.parse(JSON.stringify(item.children));
    subToc[0].selected = true;
    writeFileSync(
      join(DATA_DIR, `toc_${item.folderName}.json`),
      JSON.stringify([subToc], undefined, 2),
      'utf8',
    );
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
        const folderConfigFilename = join(
          currentFolder,
          subfolder,
          'index.yml',
        );
        const folderConfig = existsSync(folderConfigFilename)
          ? YAML.parse(readFileSync(folderConfigFilename, 'utf8'))
          : {};
        const subtoc = {
          groupName:
            folderConfig.menuLabel || subfolder.replace(/^[0-9]*_/, ''),
          folderName: subfolder,
          children: [],
        };
        toc.push(subtoc);
        processFolder(basename, join(folder, subfolder), subtoc.children);
      }
    }
  }

  /**
   * We process a folder that contains a structure
   * @param {string} basename
   * @param {string} folder
   * @param {object} toc
   */
}
