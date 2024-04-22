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
export async function createExercisesCorrection(commandDir, options = {}) {
  const { dataDir = commandDir } = options;

  const correctionDir = join(dataDir, 'correction');
  mkdirSync(correctionDir, { recursive: true });

  // need to find all the folders containing a file with .mol extension
  const folders = readdirSync(dataDir, { withFileTypes: true, recursive: true })
    .filter((entity) => entity.isDirectory())
    .filter((entity) => {
      const dirname = join(entity.path, entity.name);
      return (
        readdirSync(dirname).filter((file) =>
          file.toLowerCase().endsWith('.mol'),
        ).length > 0
      );
    });

  // we group the folders by the parent folder
  const topics = {};
  for (let folder of folders) {
    const parent = folder.path.split('/').slice(-1);

    if (!topics[parent]) {
      topics[parent] = {
        label: parent,
        folders: [],
        files: [],
      };
    }
    topics[parent].folders.push(folder);
  }

  const mdLines = [];

  for (let topic in topics) {
    mdLines.push(`\n## ${topic}\n`);
    const currentDir = join(correctionDir, topic);
    mkdirSync(currentDir, { recursive: true });
    // create a md table with 2 columns
    mdLines.push('| Exercise | Correction |');
    mdLines.push('|----------|------------|');
    for (let folder of topics[topic].folders) {
      const files = readdirSync(join(folder.path, folder.name)).filter((file) =>
        file.toLowerCase().endsWith('.mol'),
      );
      if (files.length !== 1) continue;
      for (let file of files) {
        const molfile = readFileSync(
          join(folder.path, folder.name, file),
          'utf8',
        );
        const molecule = Molecule.fromMolfile(molfile);
        writeFileSync(
          join(currentDir, `${folder.name}.svg`),
          molecule.toSVG(300, 200, undefined, { autoCrop: true }),
          'utf8',
        );
        // need to encode image url
        mdLines.push(
          `| ${folder.name} | ![${folder.name}](./${encodeURIComponent(topic)}/${encodeURIComponent(folder.name)}.svg) |`,
        );
      }
    }
  }

  writeFileSync(join(correctionDir, 'README.md'), mdLines.join('\n'), 'utf8');
}
