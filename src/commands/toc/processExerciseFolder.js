import { lstatSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import debugFct from 'debug';
import { hashElement } from 'folder-hash';
import { createTree } from 'jcampconverter';
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
 * @param {boolean} [options.cleanJCAMP] - keep only the spectrum in the JCAMP-DX
 */

export async function processExerciseFolder(
  basename,
  folder,
  toc,
  options = {},
) {
  let { spectraFilter, keepIdCode = false, cleanJCAMP = false } = options;
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
    if (cleanJCAMP) {
      loadAndClean(join(currentFolder, spectrumName));
    }

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

/**
 * We try to keep only the spectrum in the JCAMP-DX file
 */
function loadAndClean(path) {
  const jcamp = readFileSync(path, 'utf8');
  const tree = createTree(jcamp);
  const flatten = [];
  flattenTree(tree, flatten);
  if (flatten.length < 2) {
    return;
  }
  const nmrs = flatten.filter((entry) =>
    entry.dataType?.toLowerCase().includes('nmr'),
  );
  if (nmrs.length < 2) {
    if (!process.env.VITEST) {
      writeFileSync(path, nmrs[0].jcamp, 'utf8');
    }
    return;
  }
  const spectra = nmrs.filter((entry) =>
    entry.dataType?.toLowerCase().includes('spectrum'),
  );
  if (spectra.length < 2) {
    if (!process.env.VITEST) {
      writeFileSync(path, spectra[0].jcamp, 'utf8');
    }
    return;
  }
  debug('loadAndClean did not find a spectrum');
}

function flattenTree(entries, flatten) {
  for (const entry of entries) {
    if (entry.children) {
      flattenTree(entry.children, flatten);
    }
    flatten.push(entry);
  }
}
