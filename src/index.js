/* eslint-disable no-unused-expressions */
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { appendLinks } from './commands/appendLinks';
import { createExercisesTOC } from './commands/createExercisesTOC';
import { deleteJSONs } from './commands/deleteJSONs';
import { deleteStructures } from './commands/deleteStructures';
import { createGeneralTOC } from './commands/createGeneralTOC';

const homeDir = process.cwd();
yargs(hideBin(process.argv))
  .scriptName('nmrium')
  .command({
    command: 'createExercisesTOC [options]',
    aliases: [],
    desc: 'Build toc.json for exercises',
    builder: (yargs) => yargs,
    handler: (argv) => {
      createExercisesTOC(homeDir, { ...argv });
    },
  })
  .command({
    command: 'createGeneralTOC [options]',
    aliases: [],
    desc: 'Build a general toc.json',
    builder: (yargs) => yargs,
    handler: (argv) => {
      createGeneralTOC(homeDir, { ...argv });
    },
  })
  .command({
    command: 'deleteJSONs [options]',
    desc: 'Remove all .json files',
    builder: (yargs) => yargs,
    handler: (argv) => {
      deleteJSONs(homeDir, { ...argv });
    },
  })
  .command({
    command: 'deleteStructures [options]',
    desc: 'Remove all .json files',
    builder: (yargs) => yargs,
    handler: (argv) => {
      deleteStructures(homeDir, { ...argv });
    },
  })
  .command({
    command: 'appendLinks [options]',
    aliases: [],
    desc: 'Replace <-- LINKS --> placeholder from README.md file',
    builder: (yargs) => {
      yargs.option('baseURL', {
        alias: 'b',
        type: 'string',
        description: 'Base URL to which to append JSON url',
      });
    },
    handler: (argv) => {
      appendLinks(homeDir, { ...argv });
    },
  })
  .option('dataDir', {
    alias: 'd',
    type: 'string',
    description: 'Home directory containing the data',
  })
  .demandCommand().argv;
