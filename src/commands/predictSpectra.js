/* eslint-disable no-console */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { spectrum1DToJCAMPDX } from '@zakodium/nmrium-core-plugins';
import { predictSpectra as predictor } from 'nmr-processing';
import OCL from 'openchemlib';
import { nbLabileH } from 'openchemlib-utils';

const { Molecule } = OCL;
/**
 * Add the links based on all the available toc files
 * @param {string} commandDir
 * @param {object} [options={}]
 * @param {string} [options.dataDir]
 * @param {number} [options.frequency]
 */
export async function predictSpectra(commandDir, options = {}) {
  const { dataDir = commandDir, frequency = 400 } = options;

  // we search for all the folders and we check if there is a molfile
  // if there is a molfile we predict the spectra
  const folders = readdirSync(dataDir, { withFileTypes: true, recursive: true })
    .filter((entity) => entity.isDirectory())
    .map((entity) => join(entity.path, entity.name));
  for (let folder of folders) {
    const files = readdirSync(folder).filter((file) =>
      file.toLowerCase().endsWith('.mol'),
    );
    if (files.length === 0) continue;

    const outputFilename = join(folder, '1h.jdx');
    if (existsSync(outputFilename)) {
      console.log(`Skipping: ${folder} because it already has a 1H jdx file`);
      continue;
    }

    const molfile = readFileSync(join(folder, files[0]), 'utf8');
    const molecule = Molecule.fromMolfile(molfile);

    if (nbLabileH(molecule) > 0) {
      console.log(`Skipping: ${folder}because it has labile protons`);
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const spectra = await predictor(molecule, {
      prediction: { predictOptions: { H: {} } },
      simulation: {
        frequency,
        oneD: {
          proton: { from: 0, to: 14 },
          nbPoints: 65536,
          lineWidth: 1,
        },
      },
    });
    const jcamp = spectrum1DToJCAMPDX(spectra.spectra[0]);
    writeFileSync(outputFilename, jcamp, 'utf8');
  }
}
