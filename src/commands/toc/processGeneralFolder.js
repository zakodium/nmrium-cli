import {
  lstatSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';

import debugFct from 'debug';
import { hashElement } from 'folder-hash';
import { createTree } from 'jcampconverter';
import { migrate } from 'nmr-load-save'

import { getFolderConfig } from './getFolderConfig.js';

const debug = debugFct('nmrium.general');

const URL_FOLDER = '.';
let dataCount = 0;

export async function processGeneralFolder(basename, folder, toc, options) {
  const currentFolder = join(basename, folder);
  options = { ...options, ...getFolderConfig(currentFolder) }

  const { id, nmrium } = await loadData(currentFolder, options);


  const targetPath = join(basename, folder, 'index.json');
  debug(`Create: ${targetPath}`);

  writeFileSync(
    targetPath,
    JSON.stringify(nmrium, undefined, 2),
    'utf8',
  );

  let title =
    options.menuLabel ||
    folder
      .replace(/^[^/]*\//, '')
      .replace(/^[0-9]*$/, '')
      .replace(/^[0-9]*_/, '') ||
    `Data ${++dataCount}`;
  const tocEntry = {
    id,
    file: `${URL_FOLDER}/${folder}/index.json`,
    title,
    selected: dataCount === 1 || undefined,
  };
  toc.push(tocEntry);
}

async function loadData(currentFolder, options = {}) {

  // Loading all the molfiles
  const molfileNames = readdirSync(currentFolder).filter((file) =>
    file.toLowerCase().endsWith('.mol'),
  );
  const molecules = [];
  for (let molfileName of molfileNames) {
    const molfile = readFileSync(join(currentFolder, molfileName), 'utf8');
    molecules.push({ molfile });
  }

  const entries = readdirSync(currentFolder);
  const spectra = [];
  // we process only the folder if there is an answer (structure.mol)
  const id = (
    await hashElement(currentFolder, {
      folders: { exclude: ['*'] },
      files: { exclude: ['*.json'] },
    })
  ).hash;
  for (let filename of entries.filter(
    (file) =>
      lstatSync(join(currentFolder, file)).isFile() && file.match(/dx$/i),
  )) {
    // We have a look at the title
    const jcampText = readFileSync(join(currentFolder, filename));
    const tree = createTree(jcampText, {});
    const title = tree[0]?.title;
    const spectrum = {
      source: {
        jcampURL: `./${filename}`,
      },
    };

    spectrum.display = {
      name: title || filename.replace(/^.*\//, ''),
    };

    spectra.push(spectrum);
  }

  const nmrium = migrate({ spectra, molecules });
  if (options.settings) {
    nmrium.settings = options.settings;
  }
  return { id, nmrium }
}