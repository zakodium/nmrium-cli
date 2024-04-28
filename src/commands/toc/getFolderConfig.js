import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

import YAML from 'yaml';

export function getFolderConfig(folder) {
  const folderConfigFilename = join(folder, 'index.yml');
  const folderConfig = existsSync(folderConfigFilename)
    ? YAML.parse(readFileSync(folderConfigFilename, 'utf8'))
    : {};

  const defaultFolderConfig = folderConfig.default || {};
  delete folderConfig.default;

  loadSettings(folderConfig, folder);
  loadSettings(defaultFolderConfig, folder);


  return {
    folderConfig: { ...defaultFolderConfig, ...folderConfig }, defaultFolderConfig
  };
}

function loadSettings(config, folder) {
  if (config.settingsFilename) {
    const settingsFilename = join(folder, config.settingsFilename);
    if (existsSync(settingsFilename)) {
      config.settings = JSON.parse(
        readFileSync(settingsFilename, 'utf8'),
      );
    }
  }
}