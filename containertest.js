/*
    node --expose-gc containertest.js
    js containertest.js
     or open containertest.html in your browser.
*/

var OBJECT_COUNT   = 13000000;
var STEP_SIZE      = 100000;
var FULL_TEST_RUNS = 1;

function TestObject (index) {
    this.index = index;
};

function Case () {
    this.map = null;
    this.weakMap = null;
    this.jsObj = null;

    var timeStarts = Object.create(null);

    this.time = function (key) {
        timeStarts[key] = Date.now();
    };

    this.timeEnd = function (key) {
        var ended = Date.now();
        var started = timeStarts[key];

        delete timeStarts[key];

        if (typeof (started) !== "number")
            throw new Error("Mismatched start/end");

        var elapsed = ended - started;
        this.log(key + ", " + elapsed.toFixed(0));
    };

    if (
        (typeof (window) === "object") &&
        (typeof (document) === "object") &&
        document.getElementById("log")
    ) {
        var logTextarea = document.getElementById("log");
        this.log = function () {
            logTextarea.value += Array.prototype.join.call(arguments, " ") + "\n";
        };
    } else if (typeof (console) === "object") {
        this.log = console.log.bind(console);
        // this.time = console.time.bind(console);
        // this.timeEnd = console.timeEnd.bind(console);
    } else {
        this.log = function () {
            print.apply(null, arguments);
        };
    }

    this.log("// Creating " + OBJECT_COUNT + " test object instances");

    this.time("startup");

    this.objects = new Array(OBJECT_COUNT);
    for (var i = 0; i < OBJECT_COUNT; i++)
        this.objects[i] = new TestObject(i);

    this.timeEnd("startup");

    if (typeof (gc) === "function") {
        this.collectGarbage = gc;
    } else {
        this.log("No triggered garbage collection available; this may negatively impact results.");

        this.collectGarbage = function noManualGcAvailable () {
        };
    }

    this.collectGarbage();
};

Case.prototype.setUp = function () {
    this.map = new Map();
    this.weakMap = new WeakMap();
    this.weakSet = new WeakSet();

    this.jsObj = Object.create(null);

    this.collectGarbage();
};

Case.prototype.logTick = function (i, isEnd) {
    var endpoint = Math.min(i + STEP_SIZE, OBJECT_COUNT) - 1;
    // var text = "[" + String(i) + "-" + String(endpoint) + "]";
    var text = String(i);
    if (isEnd)
        this.timeEnd(text);
    else
        this.time(text);
};

Case.prototype.runMap = function () {
    this.setUp();

    this.log("// new Map()");
    this.time("js Map");

    for (var i = 0; i < OBJECT_COUNT; i += STEP_SIZE) {
        this.logTick(i, false);
        for (var j = 0, n = Math.min(OBJECT_COUNT - i, STEP_SIZE); j < n; j++) {
            var k = (i + j) | 0;

            var obj = this.objects[k];
            this.map.set(obj, k);
        }
        this.logTick(i, true);
    }

    this.timeEnd("js Map");

    this.tearDown();
};

Case.prototype.runJsObject = function () {
    this.setUp();

    this.log("// Object.create(null)");
    this.time("js object");

    for (var i = 0; i < OBJECT_COUNT; i += STEP_SIZE) {
        this.logTick(i, false);
        for (var j = 0, n = Math.min(OBJECT_COUNT - i, STEP_SIZE); j < n; j++) {
            var k = (i + j) | 0;

            var obj = this.objects[k];
            this.jsObj[obj.index] = k;
        }
        this.logTick(i, true);
    }

    this.timeEnd("js object");

    this.tearDown();
};

Case.prototype.runWeakMap = function () {
    this.setUp();

    this.log("// new WeakMap()");
    this.time("weakmap");

    for (var i = 0; i < OBJECT_COUNT; i += STEP_SIZE) {
        this.logTick(i, false);
        for (var j = 0, n = Math.min(OBJECT_COUNT - i, STEP_SIZE); j < n; j++) {
            var k = (i + j) | 0;

            var obj = this.objects[k];
            this.weakMap.set(obj, k);
        }
        this.logTick(i, true);
    }

    this.timeEnd("weakmap");

    this.tearDown();
};

Case.prototype.runWeakSet = function() {
    this.setUp();
    this.log("// new WeakSet()");
    this.time("weakset");
    for (var i = 0; i < OBJECT_COUNT; i += STEP_SIZE) {
        this.logTick(i, false);
        for (var j = 0, n = Math.min(OBJECT_COUNT - i, STEP_SIZE); j < n; j++) {
            var k = (i + j) | 0;
            var obj = this.objects[k];
            this.weakSet.add(obj);
        }
        this.logTick(i, true);
    }
    this.timeEnd("weakset");
    this.tearDown();
}

Case.prototype.tearDown = function () {
    if (this.map.clear)
        this.map.clear();

    // *displeased noises*
    if (this.weakMap.clear)
        this.weakMap.clear();

    this.map = null;
    this.weakMap = null;
    this.jsObj = null;

    this.collectGarbage();
};

{
    var c = new Case();

    for (var i = 0; i < FULL_TEST_RUNS; i++) {
        c.runJsObject();
        c.runMap();
        c.runWeakMap();
        c.runWeakSet();
    }

    c.log("// done");
}