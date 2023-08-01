const { spawnSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const packageName = 'puppeteer';

Object.defineProperty(Array.prototype, 'shuffle', {
  value: function() {
      for (let i = this.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [this[i], this[j]] = [this[j], this[i]];
      }
      return this;
  }
});

let all = [];

const list =  spawnSync('npm', ['view', packageName, 'versions', '--json']);
all = JSON.parse(list.stdout).filter(version => {
  if (version.includes('rc') || version.includes('beta') || version.includes('next')) return false;
  return true;
});
// all.shuffle();
console.log('all versions: ', all);

const renderers = {};
all.forEach(version => {
  renderers[`puppeteer_${version}`] = {
    puppeteer: () => require(`puppeteer_${version}`),
    options: {}
  };
});

const run = async (templatePath, puppeteer, name) => {
  const start = Date.now();

  const fullPath = path.resolve(process.cwd(), templatePath);
	const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
    ],
  });
	const page = await browser.newPage();
  page.setJavaScriptEnabled && page.setJavaScriptEnabled(false);

	await page.goto('file:' + fullPath, {
    waitUntil: ['load', 'domcontentloaded'],
    timeout: 1000 * 60,
  });

	// Generate PDF at default resolution
	const pdf = await page.pdf({format: 'A4'});

  const end = Date.now();
  // Write PDF to file
  fs.writeFileSync(`default_${name}.pdf`, pdf);

	await browser.close();
  return end - start;
};

// const took = run('sample.html', require('puppeteer_1.6.2'));
// console.log(`Version 1.6.2 took ${took}ms`);
async function main() {
  for (const [name, { puppeteer, options }] of Object.entries(renderers)) {
    let hasError = false;

    const start = Date.now();
    // console.log(`Start: ${name}`);
    try {
      await run('sample.html', puppeteer(), name);
    } catch (e) {
      hasError = true;
      // console.log(e);
      // console.warn(`Version ${name} failed to load or generate the PDF. Go to the next version.(${e.message})`);
    } finally {
      if (!hasError) {
        const stats = fs.statSync(`default_${name}.pdf`);
        const size = stats.size;
        const end = Date.now();
        console.log(`${name}, ${end - start}, ${size}`);
      }
      execSync('sleep 5');
    }
  };
}

main();