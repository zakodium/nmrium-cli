/* eslint-disable no-console */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import OCL from 'openchemlib';

const { Molecule } = OCL;
/**
 * Add the links based on all the available toc files
 * @param {string} commandDir
 * @param {object} [options={}]
 * @param {string} [options.dataDir]
 */
export async function createMolfilesFromSMILES(commandDir, options = {}) {
  const { dataDir = commandDir } = options;

  // we search for the file that contains the smiles. It should end with .txt
  const files = readdirSync(dataDir).filter((file) =>
    file.toLowerCase().endsWith('.txt'),
  );
  if (files.length === 0) {
    console.log('No file with .txt extension found');
    return;
  }
  if (files.length > 1) {
    console.log('More than one file with .txt extension found');
    return;
  }
  const smiles = readFileSync(join(dataDir, files[0]), 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  for (let i = 0; i < smiles.length; i++) {
    const molecule = Molecule.fromSmiles(smiles[i]);
    const folderName = `0000${i + 1}`.slice(-2);
    console.log(`Creating folder ${folderName}`);
    mkdirSync(join(dataDir, folderName), { recursive: true });
    writeFileSync(
      join(dataDir, folderName, 'structure.mol'),
      molecule.toMolfile(),
      'utf8',
    );
  }
}
