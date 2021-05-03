/* eslint-disable no-unused-expressions */
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { createToc } from './toc/createToc';

const homeDir = process.cwd();
yargs(hideBin(process.argv))
  .scriptName('nmrium')
  .command(
    'toc [options]',
    'build toc.json',
    () => {},
    (argv) => {
      createToc({ homeDir, ...argv });
    },
  )
  .option('clean', {
    alias: 'c',
    type: 'boolean',
    description: 'Remove all .json files',
  })
  .option('nostructure', {
    type: 'boolean',
    description: 'Remove all structure.mol files',
  })
  .demandCommand().argv;
