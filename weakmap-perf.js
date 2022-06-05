let iterations = 1000;
let loopCount = 2000;
// 2000000

let testResult = {};
const { PerformanceObserver, performance } = require('node:perf_hooks');
let logResult = () => {
    console.table(
        Object.entries(testResult).sort((a,b)=>{
            return a[1] - b[1];
        }).map(obj=>{
            // obj[1] /= iterations;
            return obj;
        })
    );
};

class Position {
  constructor(line, col, index) {
    this.line = void 0;
    this.column = void 0;
    this.index = void 0;
    this.line = line;
    this.column = col;
  }
}

let obs = new PerformanceObserver((list, obs)=>{
    const entries = list.getEntriesByType("measure");
    for (let i = 0; i < entries.length; i++) {
        testResult[entries[i].name] = testResult[entries[i].name] || 0;
        testResult[entries[i].name] += entries[i].duration;
    }

    logResult();
    performance.clearMarks();
    obs.disconnect();
});

obs.observe({
    entryTypes: ['measure']
});

// Generate random integer
let getRandInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate an array of random integers in a given range
let randomArrayInRange = (n, min, max) => Array.from(
    { length: n }, 
    () => getRandInt(min, max)
);

// Generate array with point objects
let generatePoints = (n, ...args) => {
    let points = [];
    for (let i = 0; i < n; i++) {
        points.push(new Position( 
          getRandInt(...args),
          getRandInt(...args), 0
        ));
    }
    return points;
}


for (let i = 0; i < iterations; i++) {
    let randInts = randomArrayInRange(loopCount, 1, 1000); 
    let randObjs = generatePoints(loopCount, 1, 1000);

    let map = new Map();
    let weakMap = new WeakMap();

    performance.mark('A');
    for (let i = 0; i < randInts.length; i++) {
        let v = map.set(randInts[i], randObjs[i]);
    }
    performance.mark('B');
    performance.measure('Map.set', 'A', 'B');

    performance.mark('A');
    for (let i = 0; i < randInts.length; i++) {
        let v = weakMap.set(randObjs[i], randInts[i]);
    }
    performance.mark('B');
    performance.measure('WeakMap.set', 'A', 'B');


    performance.mark('A');
    for (let i = 0; i < randInts.length; i++) {
        let v = map.get(randInts[i]);
    }
    performance.mark('B');
    performance.measure('Map.get', 'A', 'B');

    performance.mark('A');
    for (let i = 0; i < randInts.length; i++) {
        let v = weakMap.get(randObjs[i]);
    }
    performance.mark('B');
    performance.measure('WeakMap.get', 'A', 'B');

    performance.mark('A');
    for (let i = 0; i < randInts.length; i++) {
        Math.floor(Math.random() * 2000000);
    }
    performance.mark('B');
    performance.measure('rand', 'A', 'B');
}

console.table(testResult);