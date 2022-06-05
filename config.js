const babelDevPath = process.env.BABEL_PARSER_PATH || "../babel/packages/babel-parser";

const { spawnSync } = require('child_process');
const packageName = '@babel/parser';

let all = [];
if (process.env.BABEL_PARSER) {
  all = [process.env.BABEL_PARSER];
} else if (process.env.PARSER_ALL) {
  const list =  spawnSync('npm', ['view', packageName, 'versions', '--json']);
  all = JSON.parse(list.stdout);
}

// const babelDevParse = require(babelDevPath).parse;
const acornParse = require("acorn").parse;
const esprimaParse = require("esprima").parse;
const meriyahParse = require("meriyah").parseModule;

exports.files = [
  "./fixtures/es5/angular.js",
  "./fixtures/es5/ember.debug.js",
  "./fixtures/es5/babylon-dist.js",
  "./fixtures/es5/jquery.js",
  "./fixtures/es5/backbone.js",
  "./fixtures/es5/react-with-addons.js",
  "./fixtures/es6/angular-compiler.js",
  "./fixtures/es6/material-ui-core.js",
].filter(file => {
  return !process.env.FILE || file.includes(process.env.FILE)
});

exports.benchmarkOptions = {
  minSamples: 16000
};

const parsers = {
  acorn: {
    parse: acornParse,
    options: { sourceType: "module", locations: true }
  },
  esprima: {
    parse: esprimaParse,
    options: { sourceType: "module", loc: true, comment: true, attachComment: true }
  },
  meriyah: {
    parse: meriyahParse,
    options: { loc: true }
  },
};

all.forEach(version => {
  if (version.includes('rc') || version.includes('beta')) return;

  parsers[`babel_parser_${version}`] = {
    parse: require(`@babel/parser_${version}`).parse,
    options: { sourceType: "module" }
  }
})

const parserSelection = (function () {
  if (process.env.PARSER_ALL) {
    return Object.keys(parsers);
  }
  if (process.env.PARSER) {
    return process.env.PARSER.split(",");
  }
  if (process.env.BABEL_PARSER) {
    return [`babel_parser_${process.env.BABEL_PARSER}`]
  }
  return ["dev"];
})();

exports.parsers = Object.keys(parsers).filter(key => {
  return parserSelection.includes(key);
}).reduce((p, key) => {
  p[key] = parsers[key];
  return p;
}, {});
