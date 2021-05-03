'use strict';

var helpers = require('yargs/helpers');
var yargs = require('yargs/yargs');
var fs = require('fs');
var path = require('path');
var Debug = require('debug');
var dir = require('fs-readdir-recursive');
var YAML = require('yaml');
var md5 = require('md5');
var openchemlib = require('openchemlib');
var uuid = require('uuid');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var yargs__default = /*#__PURE__*/_interopDefaultLegacy(yargs);
var Debug__default = /*#__PURE__*/_interopDefaultLegacy(Debug);
var dir__default = /*#__PURE__*/_interopDefaultLegacy(dir);
var YAML__default = /*#__PURE__*/_interopDefaultLegacy(YAML);
var md5__default = /*#__PURE__*/_interopDefaultLegacy(md5);

const debug$1 = Debug__default['default']('Process exercise folder');

const URL_FOLDER = '.';
let exercise = 0;

function processExerciseFolder(basename, folder, toc) {
  const currentFolder = path.join(basename, folder);
  const entries = fs.readdirSync(currentFolder);
  const spectra = [];
  // we process only the folder if there is an answer (structure.mol)
  const molfile = fs.readFileSync(path.join(currentFolder, 'structure.mol'), 'utf8');
  // const molecules = [{ molfile }];

  const molecule = openchemlib.Molecule.fromMolfile(molfile);
  const uuid$1 = uuid.v4();
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
  debug$1(`Create: ${targetPath}`);

  fs.writeFileSync(targetPath, JSON.stringify({ spectra }, undefined, 2), 'utf8');

  let title = folder.replace(/^[^/]*\//, '').replace(/^[0-9]*_/, '');
  if (title.match(/^[0-9]{2,10}-[0-9]{2}-[0-9]$/)) {
    // a cas number, we will not give the answer to the students !
    title = `Exercise ${++exercise}`;
  }
  const tocEntry = {
    uuid: uuid$1,
    mf,
    idCodeHash,
    file: `${URL_FOLDER}/${folder}/index.json`,
    title,
    selected: exercise === 1 || undefined,
  };

  toc.push(tocEntry);
}

const debug = Debug__default['default']('Create toc');

const DATA_FOLDER = '.';

/**
 * We process a folder that contains a structure
 * @param {string} basename
 * @param {string} folder
 * @param {object} toc
 */
function createToc(options = {}) {
  const { homeDir } = options;
  const dataDir = path.join(homeDir, DATA_FOLDER);

  console.log('writeABC');
  fs.writeFileSync(path.join(dataDir, 'abc.json'), 'ABC', 'utf8');
  writeDEF(dataDir);

  let toc = [];
  processFolder(dataDir, '.', toc);

  if (options.c) {
    const files = dir__default['default'](dataDir).filter((file) => file.endsWith('.json'));
    for (let file of files) {
      fs.unlinkSync(file);
    }
  }

  debug(`Save: ${path.join(dataDir, 'toc.json')}`);
  fs.writeFileSync(
    path.join(dataDir, 'abc.json'),
    JSON.stringify(toc, undefined, 2),
    'utf8',
  );
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
      JSON.stringify([subToc], undefined, 2),
      'utf8',
    );
  }
}

function writeDEF(dataDir) {
  console.log('writeDEF');
  fs.writeFileSync(path.join(dataDir, 'def.json'), 'DEF', 'utf8');
}

function processFolder(basename, folder, toc) {
  debug('Processing folder: ', basename, folder);
  const currentFolder = path.join(basename, folder);
  const entries = fs.readdirSync(currentFolder);

  const folders = entries.filter(
    (file) =>
      !file.startsWith('.') &&
      fs.lstatSync(path.join(currentFolder, file)).isDirectory(),
  );
  for (let subfolder of folders) {
    if (fs.existsSync(path.join(currentFolder, subfolder, 'structure.mol'))) {
      console.log('WRITE');
      console.log(path.join(currentFolder, subfolder, 'abc.json'));
      fs.writeFileSync(path.join(currentFolder, subfolder, 'abc.json'), 'ABC', 'utf8');

      processExerciseFolder(basename, path.join(folder, subfolder), toc);
    } else {
      const folderConfigFilename = path.join(currentFolder, subfolder, 'index.yml');
      const folderConfig = fs.existsSync(folderConfigFilename)
        ? YAML__default['default'].parse(fs.readFileSync(folderConfigFilename, 'utf8'))
        : {};
      const subtoc = {
        groupName: folderConfig.menuLabel || subfolder.replace(/^[0-9]*_/, ''),
        folderName: subfolder,
        children: [],
      };
      toc.push(subtoc);
      processFolder(basename, path.join(folder, subfolder), subtoc.children);
    }
  }
}

/* eslint-disable no-unused-expressions */

const homeDir = process.cwd();
yargs__default['default'](helpers.hideBin(process.argv))
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
  .demandCommand().argv;
