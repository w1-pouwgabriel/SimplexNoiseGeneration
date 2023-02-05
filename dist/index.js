"use strict";
(() => {
  // src/SimplexNoise.ts
  var Noise = class {
    constructor() {
      this.tables = buildPermutationTables(Math.random);
    }
    getNumber() {
      return 0;
    }
    get2D(x, y) {
      return noise2D(this.tables, x, y);
    }
    get3D(x, y, z) {
      return noise3D(this.tables, x, y, z);
    }
  };
  var noise2D = (tables, x, y) => {
    const { perm, permMod12 } = tables;
    let n0 = 0, n1 = 0, n2 = 0;
    var s = (x + y) * F2;
    var i = Math.floor(x + s);
    var j = Math.floor(y + s);
    var t = (i + j) * G2;
    const x00 = i - t;
    const y00 = j - t;
    const x0 = x - x00;
    const y0 = y - y00;
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    const ii = i & 255;
    const jj = j & 255;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      const gi0 = permMod12[ii + perm[jj]] * 3;
      t0 *= t0;
      n0 = t0 * t0 * (GRAD3[gi0] * x0 + GRAD3[gi0 + 1] * y0);
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      const gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
      t1 *= t1;
      n1 = t1 * t1 * (GRAD3[gi1] * x1 + GRAD3[gi1 + 1] * y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      const gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
      t2 *= t2;
      n2 = t2 * t2 * (GRAD3[gi2] * x2 + GRAD3[gi2 + 1] * y2);
    }
    return 70 * (n0 + n1 + n2);
  };
  var noise3D = (tables, x, y, z) => {
    const { perm, permMod12 } = tables;
    let n0 = 0, n1 = 0, n2 = 0, n3 = 0;
    const s = (x + y + z) * F3;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const k = Math.floor(z + s);
    const t = (i + j + k) * G3;
    const x00 = i - t;
    const y00 = j - t;
    const z00 = k - t;
    const x0 = x - x00;
    const y0 = y - y00;
    const z0 = z - z00;
    let i1, j1, k1;
    let i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      }
    } else {
      if (y0 < z0) {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else if (x0 < z0) {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      }
    }
    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2 * G3;
    const y2 = y0 - j2 + 2 * G3;
    const z2 = z0 - k2 + 2 * G3;
    const x3 = x0 - 1 + 3 * G3;
    const y3 = y0 - 1 + 3 * G3;
    const z3 = z0 - 1 + 3 * G3;
    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 >= 0) {
      const gi0 = permMod12[ii + perm[jj + perm[kk]]] * 3;
      t0 *= t0;
      n0 = t0 * t0 * (GRAD3[gi0] * x0 + GRAD3[gi0 + 1] * y0 + GRAD3[gi0 + 2] * z0);
    }
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 >= 0) {
      const gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3;
      t1 *= t1;
      n1 = t1 * t1 * (GRAD3[gi1] * x1 + GRAD3[gi1 + 1] * y1 + GRAD3[gi1 + 2] * z1);
    }
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 >= 0) {
      const gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3;
      t2 *= t2;
      n2 = t2 * t2 * (GRAD3[gi2] * x2 + GRAD3[gi2 + 1] * y2 + GRAD3[gi2 + 2] * z2);
    }
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 >= 0) {
      var gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3;
      t3 *= t3;
      n3 = t3 * t3 * (GRAD3[gi3] * x3 + GRAD3[gi3 + 1] * y3 + GRAD3[gi3 + 2] * z3);
    }
    return 32 * (n0 + n1 + n2 + n3);
  };
  var buildPermutationTables = (random) => {
    const perm = new Uint8Array(512);
    const permMod12 = new Uint8Array(512);
    const tmp = new Uint8Array(256);
    for (let i = 0; i < 256; i++)
      tmp[i] = i;
    for (let i = 0; i < 255; i++) {
      const r = i + ~~(random() * (256 - i));
      const v2 = tmp[r];
      tmp[r] = tmp[i];
      perm[i] = perm[i + 256] = v2;
      permMod12[i] = permMod12[i + 256] = v2 % 12;
    }
    const v = tmp[255];
    perm[255] = perm[511] = v;
    permMod12[255] = permMod12[511] = v % 12;
    return { perm, permMod12 };
  };
  var F2 = 0.5 * (Math.sqrt(3) - 1);
  var G2 = (3 - Math.sqrt(3)) / 6;
  var F3 = 1 / 3;
  var G3 = 1 / 6;
  var F4 = (Math.sqrt(5) - 1) / 4;
  var G4 = (5 - Math.sqrt(5)) / 20;
  var GRAD3 = new Float32Array([
    1,
    1,
    0,
    -1,
    1,
    0,
    1,
    -1,
    0,
    -1,
    -1,
    0,
    1,
    0,
    1,
    -1,
    0,
    1,
    1,
    0,
    -1,
    -1,
    0,
    -1,
    0,
    1,
    1,
    0,
    -1,
    1,
    0,
    1,
    -1,
    0,
    -1,
    -1
  ]);
  var GRAD4 = new Float32Array([
    0,
    1,
    1,
    1,
    0,
    1,
    1,
    -1,
    0,
    1,
    -1,
    1,
    0,
    1,
    -1,
    -1,
    0,
    -1,
    1,
    1,
    0,
    -1,
    1,
    -1,
    0,
    -1,
    -1,
    1,
    0,
    -1,
    -1,
    -1,
    1,
    0,
    1,
    1,
    1,
    0,
    1,
    -1,
    1,
    0,
    -1,
    1,
    1,
    0,
    -1,
    -1,
    -1,
    0,
    1,
    1,
    -1,
    0,
    1,
    -1,
    -1,
    0,
    -1,
    1,
    -1,
    0,
    -1,
    -1,
    1,
    1,
    0,
    1,
    1,
    1,
    0,
    -1,
    1,
    -1,
    0,
    1,
    1,
    -1,
    0,
    -1,
    -1,
    1,
    0,
    1,
    -1,
    1,
    0,
    -1,
    -1,
    -1,
    0,
    1,
    -1,
    -1,
    0,
    -1,
    1,
    1,
    1,
    0,
    1,
    1,
    -1,
    0,
    1,
    -1,
    1,
    0,
    1,
    -1,
    -1,
    0,
    -1,
    1,
    1,
    0,
    -1,
    1,
    -1,
    0,
    -1,
    -1,
    1,
    0,
    -1,
    -1,
    -1,
    0
  ]);

  // src/index.ts
  var Game = class {
    constructor() {
      let domElement = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
      domElement.id = "canvas";
      domElement.setAttribute("width", window.innerWidth.toString());
      domElement.setAttribute("height", window.innerHeight.toString());
      document.body.appendChild(domElement);
      let canvas = document.getElementById("canvas");
      let context = canvas.getContext("2d");
      window.addEventListener("resize", this.onResize, false);
      this.canvas = canvas;
      this.context = context;
      this._noise = new Noise();
    }
    Render() {
      var _a, _b;
      const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        let y = Math.round(i / this.canvas.height);
        let x = i;
        let color = ((_a = this._noise) == null ? void 0 : _a.get2D(x, y)) ? (_b = this._noise) == null ? void 0 : _b.get2D(x, y) : 0;
        data[i] = color * 255;
        data[i + 1] = color * 255;
        data[i + 2] = color * 255;
        data[i + 3] = 255;
      }
      this.context.putImageData(imageData, 0, 0);
      requestAnimationFrame(this.Render.bind(this));
    }
    onResize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  };
  var game = new Game();
  window.game = game;
  game.Render();
})();
