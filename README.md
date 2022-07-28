# nmrium-cli

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

CLI commands related to nmrium.

## Installation

`$ npm i --global nmrium-cli`

## Usage

It will add a new command on your computer called `nmrium`.

### Create toc.json for online exercises

```bash
cd __folder__with__exercises__
nmrium deleteJSONs
nmrium createExercisesTOC
nmrium deleteStructures
nmrium appendLinks
```

To quickly create a TOC for a folder:
```bash
nmrium createGeneralTOC
```
## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/nmrium-cli.svg
[npm-url]: https://www.npmjs.com/package/nmrium-cli
[ci-image]: https://github.com/cheminfo/nmrium-cli/workflows/Node.js%20CI/badge.svg?branch=main
[ci-url]: https://github.com/cheminfo/nmrium-cli/actions?query=workflow%3A%22Node.js+CI%22
[codecov-image]: https://img.shields.io/codecov/c/github/cheminfo/nmrium-cli.svg
[codecov-url]: https://codecov.io/gh/cheminfo/nmrium-cli
[download-image]: https://img.shields.io/npm/dm/nmrium-cli.svg
[download-url]: https://www.npmjs.com/package/nmrium-cli
