import { lstatSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import debugFct from 'debug';
import { hashElement } from 'folder-hash';
import { createTree } from 'jcampconverter';

const debug = debugFct('nmrium.general');

const URL_FOLDER = '.';
let dataCount = 0;

export async function processGeneralFolder(basename, folder, toc) {
  const currentFolder = join(basename, folder);
  const entries = readdirSync(currentFolder);
  const molfileName = readdirSync(currentFolder).filter((file) =>
    file.toLowerCase().endsWith('.mol'),
  )[0];
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

    if (!title) {
      spectrum.display = {
        name: filename.replace(/^.*\//, ''),
      };
    }

    if (molfileName) {
      const molfile = readFileSync(join(currentFolder, molfileName), 'utf8');
      spectrum.molecules = [{ molfile }];
    }
    spectra.push(spectrum);
  }

  const targetPath = join(basename, folder, 'index.json');
  debug(`Create: ${targetPath}`);

  writeFileSync(targetPath, JSON.stringify({ spectra }, undefined, 2), 'utf8');

  let title = folder
    .replace(/^[^/]*\//, '')
    .replace(/^[0-9]*$/, '')
    .replace(/^[0-9]*_/, '');
  if (!title) {
    title = `Data ${++dataCount}`;
  }
  const tocEntry = {
    id,
    file: `${URL_FOLDER}/${folder}/index.json`,
    title,
    selected: dataCount === 1 || undefined,
  };
  toc.push(tocEntry);
}
