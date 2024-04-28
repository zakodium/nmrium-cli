/* eslint-disable no-console */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';

import OCL from 'openchemlib';
import { parse } from 'sdf-parser';

const { Molecule } = OCL;
/**
 * Add the links based on all the available toc files
 * @param {string} commandDir
 * @param {object} [options={}]
 * @param {string} [options.dataDir]
 */
export async function createMolfilesFromFiles(commandDir, options = {}) {
  const { dataDir = commandDir } = options;

  const folders = [
    dataDir,
    ...readdirSync(dataDir, { withFileTypes: true, recursive: true })
      .filter((entity) => entity.isDirectory())
      .map((entity) => join(entity.path, entity.name))
      .filter((name) => !name.match(/\/\d\d$/))
      .filter((name) => !name.match(/\/\./)),
  ];

  for (let folder of folders) {
    if (existsSync(join(folder, '01'))) {
      console.log(`Skipping: ${folder} because it already contains folder 01`);
      continue;
    }
    fromSmilesFile(folder);
    fromSDFFile(folder);
  }
}

function fromSDFFile(folder) {
  const file = getFileWithExtension(folder, '.sdf');
  if (!file) return;

  const molecules = parse(readFileSync(join(folder, file), 'utf8')).molecules;

  for (let i = 0; i < molecules.length; i++) {
    const folderName = `0000${i + 1}`.slice(-2);
    console.log(`Creating folder ${folderName}`);
    mkdirSync(join(folder, folderName), { recursive: true });
    writeFileSync(
      join(folder, folderName, 'structure.mol'),
      molecules[i].molfile,
      'utf8',
    );
  }
}

function getFileWithExtension(folder, extension) {
  const files = readdirSync(folder).filter((file) =>
    file.toLowerCase().endsWith(extension),
  );
  if (files.length === 0) {
    console.log(
      `Skipping: ${folder}, no file with ${extension} extension found`,
    );
    return;
  }
  if (files.length > 1) {
    console.log(
      `Skipping: ${folder}, more than one file with ${extension} extension found`,
    );
    return;
  }
  if (existsSync(join(folder, '01'))) {
    console.log(`Skipping: ${folder} because it already contains folder 01`);
    return;
  }
  return files[0];
}

function fromSmilesFile(folder) {
  // we search for the file that contains the smiles. It should end with .txt
  const file = getFileWithExtension(folder, '.txt');
  if (!file) return;

  const smiles = readFileSync(join(folder, file), 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  for (let i = 0; i < smiles.length; i++) {
    const molecule = Molecule.fromSmiles(smiles[i]);
    const folderName = `0000${i + 1}`.slice(-2);
    console.log(`Creating folder ${folderName}`);
    mkdirSync(join(folder, folderName), { recursive: true });
    writeFileSync(
      join(folder, folderName, 'structure.mol'),
      molecule.toMolfile(),
      'utf8',
    );
  }
}
