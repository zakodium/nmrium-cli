import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

import YAML from 'yaml';

export function getFolderConfig(folder) {
  const folderConfigFilename = join(folder, 'index.yml');
  const folderConfig = existsSync(folderConfigFilename)
    ? YAML.parse(readFileSync(folderConfigFilename, 'utf8'))
    : {};
  if (folderConfig.settingsFilename) {
    const settingsFilename = join(folder, folderConfig.settingsFilename);
    if (existsSync(settingsFilename)) {
      folderConfig.settings = JSON.parse(readFileSync(settingsFilename, 'utf8'));
    }
  }
  return folderConfig;
}
