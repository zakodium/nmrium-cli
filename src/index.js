/* eslint-disable no-unused-expressions */
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
yargs(hideBin(process.argv))
  .scriptName('nmrium')
  .command('createExercisesTOC [options]', 'Build toc.json for exercises', {
    builder: (yargs) => {
      return yargs.option('keepIdCode', {
        alias: 'i',
        type: 'boolean',
        description: 'Add idCode in the exercise TOC',
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
