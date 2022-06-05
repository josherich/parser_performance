const fs = require("fs");
const { parsers, files, benchmarkOptions } = require("./config");

const testFile = "./fixtures/es5/backbone.js";
const code = fs.readFileSync(testFile, "utf-8");
const babelVersion = process.env.BABEL_PARSER

console.log(Object.keys(parsers), babelVersion)
const { parse, options } = parsers[`babel_parser_${babelVersion}`];

const parseRound = 100;
const t1 = Date.now();
for (let j = 0; j < parseRound; j++) {
	const ast = parse(code, options);
}
console.log(babelVersion, Date.now() - t1);
