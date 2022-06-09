const Benchmark = require("benchmark");
const Table = require("cli-table");

const suite = new Benchmark.Suite('WeakMap', { minSamples: 10 });
const head = ["op", "Set", "Has", "Get", "Delete"];
const table = new Table({
  head,
  style: {
    head: ["bold"]
  }
});

suite.add('Set', WeakMapSet);

suite.add('Has', WeakMapHas, {
  onStart: WeakMapSetup,
  onComplete: WeakMapTearDown
});

suite.add('Get', WeakMapGet, {
  onStart: WeakMapSetup,
  onComplete: WeakMapTearDown
});

suite.add('Delete', WeakMapDelete, {
  onStart: WeakMapSetup,
  onComplete: WeakMapTearDown
});

suite.add('prop set', propSet);
suite.add('prop get', propGet, {
  onStart: propSetup,
  onComplete: propTeardown
});

const result = [suite.name];
suite.on('cycle', function(event) {
  {
    const bench = event.target;
    const factor = bench.hz < 100 ? 100 : 1;
    const timeMs = bench.stats.mean * 1000;
    const time = (timeMs < 10)? `${Math.round(timeMs*1000)/1000}ms` : `${Math.round(timeMs)}ms`;
    const msg = `${Math.round((bench.hz * factor) /
      (factor * 1000000))}m ops/sec ±${Math.round(bench.stats.rme * 100) /
      100}% (${time})`;
    result.push(msg);
  }
  global.gc();
});

console.log(`Running benchmark for ${suite.name} ...`);

global.gc();
suite.run({ async: false });
global.gc(); // gc is disabled so ensure we run it

table.push(result);
console.log(table.toString());

var wm;
var N = 10;
var keys = [];
for (var i = 0; i < N * 2; i++) {
  keys[i] = {};
}
var poss = []

/* ------------------------------------- */

class Position {
  constructor(index) {
    this.index = index;
  }
}
function WeakMapSetup() {
  wm = new WeakMap;
  for (var i = 0; i < N; i++) {
    wm.set(keys[i], i);
  }
}
function WeakMapTearDown() {
  wm = null;
}
function WeakMapSet() {
  WeakMapSetup();
  WeakMapTearDown();
}
function WeakMapHas() {
  for (var i = 0; i < N; i++) {
    if (!wm.has(keys[i])) {
      throw new Error();
    }
  }
  for (var i = N; i < 2 * N; i++) {
    if (wm.has(keys[i])) {
      throw new Error();
    }
  }
}
function WeakMapGet() {
  for (var i = 0; i < N; i++) {
    if (wm.get(keys[i]) !== i) {
      throw new Error();
    }
  }
  for (var i = N; i < 2 * N; i++) {
    if (wm.get(keys[i]) !== undefined) {
      throw new Error();
    }
  }
}
function WeakMapDelete() {
  // This is run more than once per setup so we will end up deleting items
  // more than once. Therefore, we do not the return value of delete.
  for (var i = 0; i < N; i++) {
    wm.delete(keys[i]);
  }
}

/* ------------------------------ */
function propSetup() {
  for (var i = 0; i < N; i++) {
    poss.push(new Position(keys[i]));
  }
}
function propTeardown() {
  poss = [];
}
function propSet() {
  propSetup();
  propTeardown();
}
function propGet() {
  for (var i = 0; i < N; i++) {
    if (poss[i].index === undefined) {
      throw new Error();
    }
  }
  for (var i = N; i < 2 * N; i++) {
    if (poss[i] !== undefined) {
      throw new Error();
    }
  }
}
