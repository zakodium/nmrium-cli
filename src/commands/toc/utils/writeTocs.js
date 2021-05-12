import { writeFileSync } from 'fs';
import { join } from 'path';

import RecursiveIterator from 'recursive-iterator';

export default function writeTocs(dataDir, toc) {
  writeFileSync(
    join(dataDir, 'toc.json'),
    JSON.stringify(selectFirstSpectrum(toc), undefined, 2),
    'utf8',
  );
  for (let item of toc) {
    if (!item.folderName || !item.children || item.children.length < 1) {
      continue;
    }
    const subToc = selectFirstSpectrum(item.children);
    writeFileSync(
      join(dataDir, `toc_${item.folderName}.json`),
      JSON.stringify(subToc, undefined, 2),
      'utf8',
    );
  }
}

function selectFirstSpectrum(toc) {
  toc = JSON.parse(JSON.stringify(toc));
  for (let { node } of new RecursiveIterator(toc)) {
    if (node.file) {
      node.selected = true;
      return toc;
    }
  }
  return toc;
}
