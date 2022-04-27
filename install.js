const { spawnSync } = require('child_process');
const packageName = '@babel/parser';

const list =  spawnSync('npm', ['view', packageName, 'versions', '--json']);
const all = JSON.parse(list.stdout);

all.forEach(version => {
  if (version.includes('rc') || version.includes('beta')) return;

  let res = spawnSync('npm', ['install', '--save', `${packageName}_${version}@npm:${packageName}@${version}`]);
  console.log(res.stdout.toString())
})
