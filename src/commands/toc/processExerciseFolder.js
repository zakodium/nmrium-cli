import { lstatSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import debugFct from 'debug';
import { hashElement } from 'folder-hash';
import md5 from 'md5';
import OCL from 'openchemlib';

const { Molecule } = OCL;

const debug = debugFct('nmrium.exercise');

const URL_FOLDER = '.';
let exercise = 0;

/**
 *
 * @param {string} basename
 * @param {string} folder
 * @param {object} toc
 * @param {object} [options={}]
 * @param {string} [options.spectraFilter] - comma separated list of experiments to process, if not defined all experiments are processed
 * @param {string} [options.keepIdCode=false] - Keep idCode in the toc
 */

export async function processExerciseFolder(
  basename,
  folder,
  toc,
  options = {},
) {
  let { spectraFilter, keepIdCode = false } = options;
  if (spectraFilter) {
    spectraFilter = new RegExp(
      `^(${spectraFilter.split(',').join('|')}).`,
      'i',
    );
  }

  const currentFolder = join(basename, folder);
  const entries = readdirSync(currentFolder);
  const molfileName = readdirSync(currentFolder).filter((file) =>
    file.toLowerCase().endsWith('.mol'),
  )[0];
  const spectra = [];
  // we process only the folder if there is an answer (structure.mol)
  const molfile = readFileSync(join(currentFolder, molfileName), 'utf8');
  const molecule = Molecule.fromMolfile(molfile);

  const mf = molecule.getMolecularFormula().formula;
  const idCode = molecule.getIDCode();
  const idCodeHash = md5(idCode);
  const includedFiles = []; // we only hash the included files to find out if it is the same exercise
  for (let spectrumName of entries.filter(
    (file) =>
      lstatSync(join(currentFolder, file)).isFile() && file.match(/dx$/i),
  )) {
    if (spectraFilter && !spectrumName.match(spectraFilter)) continue;
    includedFiles.push(spectrumName);
    spectra.push({
      source: {
        jcampURL: `./${spectrumName}`,
      },
      display: {
        name: '',
      },
    });
  }

  const id = (
    await hashElement(currentFolder, {
      folders: { exclude: ['*'] },
      files: { include: [...includedFiles, '*.mol'] },
    })
  ).hash;

  const targetPath = join(basename, folder, 'index.json');
  debug(`Create: ${targetPath}`);

  writeFileSync(targetPath, JSON.stringify({ spectra }, undefined, 2), 'utf8');

  let title = folder
    .replace(/^[^/]*\//, '')
    .replace(/^[0-9]*$/, '')
    .replace(/^[0-9]*_/, '');
  if (!title) {
    title = `Exercise ${++exercise}`;
  }
  const tocEntry = {
    id,
    mf,
    idCodeHash,
    idCode: keepIdCode ? idCode : undefined,
    file: `${URL_FOLDER}/${folder}/index.json`,
    title,
    selected: exercise === 1 || undefined,
  };
  toc.push(tocEntry);
}
