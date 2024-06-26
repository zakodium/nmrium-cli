/* eslint-disable no-unused-expressions */
import { join } from 'path';

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { appendLinks } from './commands/appendLinks.js';
import { createExercisesCorrection } from './commands/createExercisesCorrection.js';
import { createExercisesTOC } from './commands/createExercisesTOC.js';
import { createGeneralTOC } from './commands/createGeneralTOC.js';
import { createMolfilesFromFiles } from './commands/createMolfilesFromFiles.js';
import { deleteJSONs } from './commands/deleteJSONs.js';
import { deleteStructures } from './commands/deleteStructures.js';
import { predictSpectra } from './commands/predictSpectra.js';

const homeDir = process.cwd();
yargs(hideBin(normalizeArgv(process.argv)))
  .scriptName('nmrium')
  .command('createExercisesTOC [options]', 'Build toc.json for exercises', {
    builder: (yargs) => {
      return yargs
        .option('appendIDCode', {
          alias: 'i',
          type: 'boolean',
          default: false,
          description: 'Add idCode in the exercise TOC',
        })
        .option('appendNoStereoIDCodeHash', {
          alias: 's',
          type: 'boolean',
          default: false,
          description:
            'Add an idCode hash without stereo information in order to consider as correct the molecule with wrong stereo information',
        })
        .option('appendRacemateIDCodeHash', {
          type: 'boolean',
          default: true,
          description:
            'Allows to check the answer considering any enantiomer as correct',
        })
        .option('cleanJCAMP', {
          type: 'boolean',
          default: false,
          description: 'Only keep the first spectrum in the JCAMP-DX file',
        });
    },
    handler: (argv) => {
      createExercisesTOC(homeDir, { ...argv });
    },
  })
  .command('createGeneralTOC [options]', 'Build a general toc.json', {
    aliases: [],
    builder: (yargs) => yargs,
    handler: (argv) => {
      createGeneralTOC(homeDir, { ...argv });
    },
  })
  .command(
    'createExercisesCorrection [options]',
    'Will scan all the folders and generate a .md file containing all the structures',
    {
      aliases: [],
      builder: (yargs) => yargs,
      handler: (argv) => {
        createExercisesCorrection(homeDir, { ...argv });
      },
    },
  )
  .command('deleteJSONs [options]', 'Remove all .json files', {
    builder: (yargs) => yargs,
    handler: (argv) => {
      deleteJSONs(homeDir, { ...argv });
    },
  })
  .command('deleteStructures [options]', 'Remove all .json files', {
    builder: (yargs) => yargs,
    handler: (argv) => {
      deleteStructures(homeDir, { ...argv });
    },
  })
  .command(
    'createMolfilesFromFiles [options]',
    'From a .txt file containing a list of SMILES or a .sdf file we will create a sequence of folder that contains a structure.mol file. This is used to quickly create exercises from a list of SMILES. There may be one file per folder.',
    {
      builder: (yargs) => yargs,
      handler: (argv) => {
        createMolfilesFromFiles(homeDir, { ...argv });
      },
    },
  )
  .command(
    'predictSpectra [options]',
    'Predict 1H spectra for all the folder in which there is a molfile',
    {
      builder: (yargs) => {
        return yargs.option('frequency', {
          alias: 'b',
          default: 400,
          type: 'number',
          description: 'Frequency of the spectrometer',
        });
      },
      handler: (argv) => {
        predictSpectra(homeDir, { ...argv });
      },
    },
  )
  .command(
    'appendLinks [options]',
    'Replace <-- LINKS --> placeholder from README.md file',
    {
      builder: (yargs) => {
        return yargs.option('baseURL', {
          alias: 'b',
          type: 'string',
          description: 'Base URL to which to append JSON url',
        });
      },
      handler: (argv) => {
        appendLinks(homeDir, { ...argv });
      },
    },
  )
  .option('dataDir', {
    alias: 'd',
    type: 'string',
    description: 'Home directory containing the data',
  })

  .demandCommand().argv;

function normalizeArgv(argv = {}) {
  if (argv.dataDir) {
    if (!argv.dataDir.startsWith('/')) {
      argv.dataDir = join(homeDir, argv.dataDir);
    }
  }
  return argv;
}
