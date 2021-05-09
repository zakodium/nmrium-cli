import { writeFileSync } from 'fs';
import { join } from 'path';

export default function writeTocs(dataDir, toc) {
  writeFileSync(
    join(dataDir, 'toc.json'),
    JSON.stringify(toc, undefined, 2),
    'utf8',
  );
  for (let item of toc) {
    if (!item.folderName || !item.children || item.children.length < 1) {
      continue;
    }
    const subToc = JSON.parse(JSON.stringify(item.children));
    subToc[0].selected = true;
    writeFileSync(
      join(dataDir, `toc_${item.folderName}.json`),
      JSON.stringify(subToc, undefined, 2),
      'utf8',
    );
  }
}
