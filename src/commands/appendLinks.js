import { lstatSync, readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

import remoteGitURL from 'git-remote-origin-url';
import parseGitURL from 'git-url-parse';

/**
 * Add the links based on all the available toc files
 * @param {string} commandDir
 * @param {object} [options={}]
 * @param {string} [options.dataDir]
 */
export async function appendLinks(commandDir, options = {}) {
  const {
    dataDir = commandDir,
    baseURL = 'https://www.nmrium.org/teaching#?toc=',
  } = options;
  if (!lstatSync(join(dataDir, 'README.md')).isFile()) return;
  if (!lstatSync(join(dataDir, 'toc.json')).isFile()) return;
  let readme = readFileSync(join(dataDir, 'README.md'), 'utf8');
  const toc = JSON.parse(readFileSync(join(dataDir, 'toc.json'), 'utf8'));

  const links = [];

  const gitInfo = parseGitURL(await remoteGitURL());
  const baseJsonUrl = `https://${gitInfo.organization}.github.io/${gitInfo.name}/`;

  links.push(`## Link to all the exercises`);
  links.push('');
  const link = `${baseURL + baseJsonUrl}toc.json`;
  links.push(`[${link}](${link})`);
  links.push('');

  // We will check if we have sub tocs
  const subTocs = toc
    .filter((item) => item.children)
    .filter((item) => existsSync(join(dataDir, `toc_${item.folderName}.json`)))
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

  writeFileSync(join(dataDir, 'README.md'), readme, 'utf8');
}
