const a = [];
for (let i = 0; i < 1e7; i++) a[i] = {};

const m = new Map();
console.time("Map.set");
for (let i = 0; i < 1e7; i++) {
  m.set(a[i], i);
}
console.timeEnd("Map.set");

console.time("Map.get");
let s = 0;
for (let i = 0; i < 1e7; i++) {
  s += m.get(a[i]);
}
console.timeEnd("Map.get");

const w = new WeakMap();
console.time("WeakMap.set");
for (let i = 0; i < 1e7; i++) {
  w.set(a[i], i);
}
console.timeEnd("WeakMap.set");
