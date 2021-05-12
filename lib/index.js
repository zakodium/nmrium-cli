'use strict';

var helpers = require('yargs/helpers');
var yargs = require('yargs/yargs');
var fs = require('fs');
var path = require('path');
var remoteGitURL = require('git-remote-origin-url');
var parseGitURL = require('git-url-parse');
var Debug = require('debug');
var YAML = require('yaml');
var folderHash = require('folder-hash');
var md5 = require('md5');
var openchemlib = require('openchemlib');
var dir = require('fs-readdir-recursive');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var yargs__default = /*#__PURE__*/_interopDefaultLegacy(yargs);
var remoteGitURL__default = /*#__PURE__*/_interopDefaultLegacy(remoteGitURL);
var parseGitURL__default = /*#__PURE__*/_interopDefaultLegacy(parseGitURL);
var Debug__default = /*#__PURE__*/_interopDefaultLegacy(Debug);
var YAML__default = /*#__PURE__*/_interopDefaultLegacy(YAML);
var md5__default = /*#__PURE__*/_interopDefaultLegacy(md5);
var dir__default = /*#__PURE__*/_interopDefaultLegacy(dir);

/**
 * Add the links based on all the available toc files
 * @param {string} commandDir
 * @param {object} [options={}]
 * @param {boolean} [options.dataDir]
 */
async function appendLinks(commandDir, options = {}) {
  const {
    dataDir = commandDir,
    baseURL = 'https://www.nmrium.org/teaching#?toc=',
  } = options;
  if (!fs.lstatSync(path.join(dataDir, 'README.md')).isFile()) return;
  if (!fs.lstatSync(path.join(dataDir, 'toc.json')).isFile()) return;
  let readme = fs.readFileSync(path.join(dataDir, 'README.md'), 'utf8');
  const toc = JSON.parse(fs.readFileSync(path.join(dataDir, 'toc.json'), 'utf8'));

  const links = [];

  const gitInfo = parseGitURL__default['default'](await remoteGitURL__default['default']());
  const baseJsonUrl = `https://${gitInfo.organization}.github.io/${gitInfo.name}/`;

  links.push(`## Link to all the exercises`);
  links.push('');
  const link = `${baseURL + baseJsonUrl}toc.json`;
  links.push(`[${link}](${link})`);
  links.push('');

  // We will check if we have sub tocs
  const subTocs = toc
    .filter((item) => item.children)
    .filter((item) => fs.existsSync(path.join(dataDir, `toc_${item.folderName}.json`)))
    .map((item) => ({
      groupName: item.groupName,
      tocName: `toc_${item.folderName}.json`,
    }));

  if (subTocs.length > 0) {
    links.push('Links to series');
    links.push('');
    for (let subToc of subTocs) {
      const link = baseURL + baseJsonUrl + subToc.tocName;
      links.push(`* [${subToc.groupName}](${link})`);
    }
  }

  readme = readme.replace('<-- LINKS -->', links.join('\n'));

  fs.writeFileSync(path.join(dataDir, 'README.md'), readme, 'utf8');
}

function writeTocs(dataDir, toc) {
  fs.writeFileSync(
    path.join(dataDir, 'toc.json'),
    JSON.stringify(toc, undefined, 2),
    'utf8',
  );
  for (let item of toc) {
    if (!item.folderName || !item.children || item.children.length < 1) {
      continue;
    }
    const subToc = JSON.parse(JSON.stringify(item.children));
    subToc[0].selected = true;
    fs.writeFileSync(
      path.join(dataDir, `toc_${item.folderName}.json`),
      JSON.stringify(subToc, undefined, 2),
      'utf8',
    );
  }
}

const debug$1 = Debug__default['default']('nmrium.toc');

/**
 * Create toc.json for the full project
 * @param {string} commandDir
 * @param {object} [options={}]
 */
async function createToc(commandDir, folderProcessor, options = {}) {
  const { dataDir = commandDir } = options;

  let toc = [];
  await processFolder(dataDir, '.', toc);
  debug$1(`Save: ${path.join(dataDir, 'toc.json')}`);
  writeTocs(dataDir, toc);

  async function processFolder(basename, folder, toc) {
    debug$1('Processing folder: ', basename, folder);
    const currentFolder = path.join(basename, folder);
    const entries = fs.readdirSync(currentFolder);

    const folders = entries.filter(
      (file) =>
        !file.startsWith('.') &&
        fs.lstatSync(path.join(currentFolder, file)).isDirectory(),
    );
    for (let subfolder of folders) {
      // is there any molfile ?
      let isDataFolder = fs.readdirSync(
        path.join(currentFolder, subfolder),
      ).some((file) => file.match(/(?:.mol|.dx|.jdx)$/i));
      if (isDataFolder) {
        await folderProcessor(basename, path.join(folder, subfolder), toc, options);
      } else {
        const folderConfigFilename = path.join(
          currentFolder,
          subfolder,
          'index.yml',
        );
        const folderConfig = fs.existsSync(folderConfigFilename)
          ? YAML__default['default'].parse(fs.readFileSync(folderConfigFilename, 'utf8'))
          : {};
        const subTOC = {
          groupName:
            folderConfig.menuLabel || subfolder.replace(/^[0-9]*_/, ''),
          folderName: subfolder,
          children: [],
        };
        toc.push(subTOC);
        await processFolder(basename, path.join(folder, subfolder), subTOC.children);
      }
    }
  }
}

const debug = Debug__default['default']('nmrium.exercise');

const URL_FOLDER = '.';
let exercise = 0;

async function processExerciseFolder(basename, folder, toc) {
  const currentFolder = path.join(basename, folder);
  const entries = fs.readdirSync(currentFolder);
  const molfileName = fs.readdirSync(currentFolder).filter((file) =>
    file.toLowerCase().endsWith('.mol'),
  )[0];
  const spectra = [];
  // we process only the folder if there is an answer (structure.mol)
  const molfile = fs.readFileSync(path.join(currentFolder, molfileName), 'utf8');
  // const molecules = [{ molfile }];

  const molecule = openchemlib.Molecule.fromMolfile(molfile);

  const uuid = (
    await folderHash.hashElement(currentFolder, {
      folders: { exclude: ['*'] },
      files: { exclude: ['*.json'] },
    })
  ).hash;

  const mf = molecule.getMolecularFormula().formula;
  const idCode = molecule.getIDCode();
  const idCodeHash = md5__default['default'](idCode);
  for (let spectrum of entries.filter(
    (file) =>
      fs.lstatSync(path.join(currentFolder, file)).isFile() && file.match(/dx$/i),
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

  const targetPath = path.join(basename, folder, 'index.json');
  debug(`Create: ${targetPath}`);

  fs.writeFileSync(targetPath, JSON.stringify({ spectra }, undefined, 2), 'utf8');

  let title = folder
    .replace(/^[^/]*\//, '')
    .replace(/^[0-9]*$/, '')
    .replace(/^[0-9]*_/, '');
  if (!title) {
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

/**
 * Add the links based on all the available toc files
 * @param {string} commandDir
 * @param {object} [options={}]
 * @param {boolean} [options.dataDir]
 */
async function createExercisesTOC(commandDir, options = {}) {
  createToc(commandDir, processExerciseFolder, options);
}

/**
 * Create toc.json for the full project
 * @param {string} commandDir
 * @param {object} [options={}]
 * @param {boolean} [options.dataDir]
 */
function deleteJSONs(commandDir, options = {}) {
  const { dataDir = commandDir } = options;
  const files = dir__default['default'](dataDir).filter((file) => file.endsWith('.json'));
  for (let file of files) {
    fs.unlinkSync(path.join(dataDir, file));
  }
}

/**
 * Delete all 'structure.mol' files
 * @param {string} commandDir
 * @param {object} [options={}]
 * @param {boolean} [options.dataDir]
 */
function deleteStructures(commandDir, options = {}) {
  const { dataDir = commandDir } = options;
  const files = dir__default['default'](dataDir).filter((file) =>
    file.toLowerCase().endsWith('.mol'),
  );
  for (let file of files) {
    fs.unlinkSync(file);
  }
}

/* eslint-disable no-unused-expressions */

const homeDir = process.cwd();
yargs__default['default'](helpers.hideBin(process.argv))
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
