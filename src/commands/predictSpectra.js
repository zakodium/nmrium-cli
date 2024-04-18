import {
  mkdirSync,
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';



import md5 from 'md5';
import { spectrum1DToJcamp } from 'nmr-load-save';
import { predictSpectra as predictor } from 'nmr-processing';
import OCL from 'openchemlib';

const { Molecule } = OCL;
/**
 * Add the links based on all the available toc files
 * @param {string} commandDir
 * @param {object} [options={}]
 */
export async function predictSpectra(commandDir, options = {}) {
  const { dataDir = commandDir } = options;
  const { protonCache = join(__dirname, '../../data/predictionCache/proton') } =
    options;
  mkdirSync(protonCache, { recursive: true });

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
    const molfile = readFileSync(join(folder, files[0]), 'utf8');
    const molecule = Molecule.fromMolfile(molfile);


    // eslint-disable-next-line no-await-in-loop
    const spectra = await predictor(molecule, {
      prediction: { predictOptions: { H: { cache: protonCache } } },
      simulation: {
        frequency: 400,
        oneD: {
          proton: { from: 0, to: 14 },
          nbPoints: 65536,
          lineWidth: 1,
        },
      },
    });
    const jcamp = spectrum1DToJcamp(spectra.spectra[0]);
    writeFileSync(join(folder, '1h.jdx'), jcamp, 'utf8');
  }
}

export function getFSCache(cacheFolder) {
  mkdirSync(cacheFolder, { recursive: true });

  return (id, prediction) => {
    console.log('getFSCache', id, prediction);
    const hash = md5(id);
    const filename = join(cacheFolder, `${hash}.json`);

    if (prediction === undefined) {
      if (existsSync(filename)) {
        console.log('Prediction from cache');
        return JSON.parse(readFileSync(filename, 'utf8'));
      }
    } else {
      console.log('Writing prediction to cache', filename);
      writeFileSync(filename, JSON.stringify(prediction));
    }
  };
}

