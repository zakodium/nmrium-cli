import { lstatSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import Debug from 'debug';
import md5 from 'md5';
import { Molecule } from 'openchemlib';
import { v4 } from 'uuid';

const debug = Debug('Process exercise folder');

const URL_FOLDER = '.';
let exercise = 0;

export function processExerciseFolder(basename, folder, toc) {
  const currentFolder = join(basename, folder);
  const entries = readdirSync(currentFolder);
  const spectra = [];
  // we process only the folder if there is an answer (structure.mol)
  const molfile = readFileSync(join(currentFolder, 'structure.mol'), 'utf8');
  // const molecules = [{ molfile }];

  const molecule = Molecule.fromMolfile(molfile);
  const uuid = v4();
  const mf = molecule.getMolecularFormula().formula;
  const idCode = molecule.getIDCode();
  const idCodeHash = md5(idCode);

  for (let spectrum of entries.filter(
    (file) =>
      lstatSync(join(currentFolder, file)).isFile() && file.match(/dx$/i),
  )) {
    spectra.push({
      source: {
        jcampURL: `./${folder}/${spectrum}`,
      },
      display: {
        name: '',
      },
    });
  }

  const targetPath = join(basename, folder, 'index.json');
  debug(`Create: ${targetPath}`);

  writeFileSync(targetPath, JSON.stringify({ spectra }, undefined, 2), 'utf8');

  writeFileSync(join(basename, 'abc.json'), 'ABC', 'utf8');

  debug(lstatSync(targetPath));

  let title = folder.replace(/^[^/]*\//, '').replace(/^[0-9]*_/, '');
  if (title.match(/^[0-9]{2,10}-[0-9]{2}-[0-9]$/)) {
    // a cas number, we will not give the answer to the students !
    title = `Exercise ${++exercise}`;
  }
  const tocEntry = {
    uuid,
    mf,
    idCodeHash,
    file: `${URL_FOLDER}/${folder}/index.json`,
    title,
    selected: exercise === 1 || undefined,
  };

  toc.push(tocEntry);
}
