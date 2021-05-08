/* eslint-disable no-unused-expressions */
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { createToc } from './toc/createToc';
import { deleteJson } from './toc/deleteJson';
import { deleteStructure } from './toc/deleteStructure';

const homeDir = process.cwd();
yargs(hideBin(process.argv))
  .scriptName('nmrium')
  .command({
    command: 'toc [options]',
    aliases: [],
    desc: 'Build toc.json',
    builder: (yargs) => yargs,
    handler: (argv) => {
      createToc(homeDir, { ...argv });
    },
  })
  .command({
    command: 'removeJSONs [options]',
    desc: 'Remove all .json files',
    builder: (yargs) => yargs,
    handler: (argv) => {
      deleteJson(homeDir, { ...argv });
    },
  })
  .command({
    command: 'removeStructures [options]',
    desc: 'Remove all .json files',
    builder: (yargs) => yargs,
    handler: (argv) => {
      deleteStructure(homeDir, { ...argv });
    },
  })
  .option('dataDir', {
    alias: 'd',
    type: 'string',
    description: 'Home directory containing the data',
  })

  .demandCommand().argv;
