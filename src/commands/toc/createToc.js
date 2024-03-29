/* eslint-disable no-await-in-loop */
import { lstatSync, existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

import debugFct from 'debug';
import YAML from 'yaml';

import writeTocs from './utils/writeTocs.js';

const debug = debugFct('nmrium.toc');

/**
 * Create toc.json for the full project
 * @param {string} commandDir
 * @param {object} [options={}]
 * @param {string} [options.dataDir=commandDir]
 * @param {boolean} [options.keepIdCode=false] - Add the idCode to the toc
 */
export async function createToc(commandDir, folderProcessor, options = {}) {
  const { dataDir = commandDir } = options;

  let toc = [];
  await processFolder(dataDir, '.', toc, folderProcessor, options);
  debug(`Save: ${join(dataDir, 'toc.json')}`);
  writeTocs(dataDir, toc);
}

async function processFolder(
  basename,
  folder,
  toc,
  folderProcessor,
  options = {},
) {
  debug('Processing folder: ', basename, folder);
  const currentFolder = join(basename, folder);
  const entries = readdirSync(currentFolder).sort((a, b) => {
    return a.split('_')[0] - b.split('_')[0];
  });

  const folders = entries.filter(
    (file) =>
      !file.startsWith('.') &&
      lstatSync(join(currentFolder, file)).isDirectory(),
  );

  for (let subfolder of folders) {
    // is there any molfile ?
    let isDataFolder = readdirSync(join(currentFolder, subfolder)).some(
      (file) => file.match(/(?:.mol|.dx|.jdx)$/i),
    );
    if (isDataFolder) {
      await folderProcessor(basename, join(folder, subfolder), toc, options);
    } else {
      const folderConfigFilename = join(currentFolder, subfolder, 'index.yml');
      const folderConfig = existsSync(folderConfigFilename)
        ? YAML.parse(readFileSync(folderConfigFilename, 'utf8'))
        : {};
      const subTOC = {
        groupName: folderConfig.menuLabel || subfolder.replace(/^[0-9]*_/, ''),
        folderName: subfolder,
        children: [],
      };
      toc.push(subTOC);
      await processFolder(
        basename,
        join(folder, subfolder),
        subTOC.children,
        folderProcessor,
        { ...options, ...folderConfig },
      );
    }
  }
}
