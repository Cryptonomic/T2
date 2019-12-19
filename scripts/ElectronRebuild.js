const path = require('path');
const execSync = require('child_process').execSync;
const fs = require('fs');
const dependencies = require('../src/package.json').dependencies;

(() => {
  const nodeModulesPath = path.join(
    __dirname,
    '..',
    'src',
    'node_modules'
  );

  if (
    Object.keys(dependencies || {}).length > 0 &&
    fs.existsSync(nodeModulesPath)
  ) {
    const electronRebuildCmd =
      '../node_modules/.bin/electron-rebuild --parallel --force --types prod,dev,optional --module-dir .';
    const cmd =
      process.platform === 'win32'
        ? electronRebuildCmd.replace(/\//g, '\\')
        : electronRebuildCmd;
    execSync(cmd, {
      cwd: path.join(__dirname, '..', 'src'),
      stdio: 'inherit'
    });
  }
})();
