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

const debug = Debug('Create toc');

const DATA_FOLDER = '.';

/**
 * We process a folder that contains a structure
 * @param {string} basename
 * @param {string} folder
 * @param {object} toc
 */
export function createToc(options = {}) {
  const { homeDir } = options;
  const dataDir = join(homeDir, DATA_FOLDER);

  writeFileSync(join(dataDir, 'abc.json'), 'ABC', 'utf8');
  writeDEF(dataDir);

  let toc = [];
  processFolder(dataDir, '.', toc);

  if (options.c) {
    const files = dir(dataDir).filter((file) => file.endsWith('.json'));
    for (let file of files) {
      unlinkSync(file);
    }
  }

  debug(`Save: ${join(dataDir, 'toc.json')}`);

  writeFileSync(
    join(dataDir, 'toc.json'),
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
      join(dataDir, `toc_${item.folderName}.json`),
      JSON.stringify([subToc], undefined, 2),
      'utf8',
    );
  }
}

function writeDEF(dataDir) {
  writeFileSync(join(dataDir, 'def.json'), 'DEF', 'utf8');
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
      console.log('WRITE');
      console.log(join(currentFolder, subfolder, 'abc.json'));
      writeFileSync(join(currentFolder, subfolder, 'abc.json'), 'ABC', 'utf8');

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
