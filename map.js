const Benchmark = require("benchmark");
const Table = require("cli-table");

const suite = new Benchmark.Suite('Map', { minSamples: 10 });
const head = ["op", "Set", "Has", "Get", "Delete"];
const table = new Table({
  head,
  style: {
    head: ["bold"]
  }
});

suite.add('Set', MapSet);

suite.add('Has', MapHas, {
  onStart: MapSetup,
  onComplete: MapTearDown
});

suite.add('Get', MapGet, {
  onStart: MapSetup,
  onComplete: MapTearDown
});

suite.add('Delete', MapDelete, {
  onStart: MapSetup,
  onComplete: MapTearDown
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

var map;
var N = 10;

/* ------------------------------------- */

function MapSetup() {
  map = new Map;
  for (var i = 0; i < N; i++) {
    map.set(i, i);
  }
}
function MapTearDown() {
  map = null;
}
function MapSet() {
  MapSetup();
  MapTearDown();
}
function MapHas() {
  for (var i = 0; i < N; i++) {
    if (!map.has(i)) {
      throw new Error();
    }
  }
  for (var i = N; i < 2 * N; i++) {
    if (map.has(i)) {
      throw new Error();
    }
  }
}
function MapGet() {
  for (var i = 0; i < N; i++) {
    if (map.get(i) !== i) {
      throw new Error();
    }
  }
  for (var i = N; i < 2 * N; i++) {
    if (map.get(i) !== undefined) {
      throw new Error();
    }
  }
}
function MapDelete() {
  // This is run more than once per setup so we will end up deleting items
  // more than once. Therefore, we do not the return value of delete.
  for (var i = 0; i < N; i++) {
    map.delete(i);
  }
}
function MapForEach() {
  map.forEach(function(v, k) {
    if (v !== k) {
      throw new Error();
    }
  });
}
