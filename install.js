const { spawnSync } = require('child_process');
const packageName = 'puppeteer';

const list =  spawnSync('npm', ['view', packageName, 'versions', '--json']);
const all = JSON.parse(list.stdout);

all.forEach(version => {
  if (version.includes('rc') || version.includes('beta') || version.includes('next')) return;
  try {
    require(`${packageName}_${version}`);
    console.log(`${packageName}_${version} installed.`);
  } catch (e) {
    let res = spawnSync('npm', ['install', '--save', `${packageName}_${version}@npm:${packageName}@${version}`]);
    console.log(res.stdout.toString())
  }
})
