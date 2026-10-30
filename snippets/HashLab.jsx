import { useState } from 'react';

// Content only: edit the text here, the layout below does not need to change.
// The four functions of the page run live on the text typed here. "abc" gives the same values as the example on the page.
// "Change one character" adds one to the code of the last character and shows how many bits of the output change.

const copy = {
  hint: 'Type a text and pick a function. Change one character and about half of the bits flip.',
  input: 'Text',
  functions: [
    { key: 'sha256', name: 'SHA-256', bits: 256 },
    { key: 'hash256', name: 'HASH256', bits: 256 },
    { key: 'ripemd160', name: 'RIPEMD-160', bits: 160 },
    { key: 'hash160', name: 'HASH160', bits: 160 },
  ],
  change: 'Change one character',
  empty: 'Type some text to see its hashes.',
};

const SHA_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function sha256(bytes) {
  const h = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
  const len = bytes.length;
  const total = (((len + 9 + 63) >> 6) << 6);
  const m = new Uint8Array(total);
  m.set(bytes);
  m[len] = 0x80;
  const bits = len * 8;
  m[total - 4] = (bits >>> 24) & 255;
  m[total - 3] = (bits >>> 16) & 255;
  m[total - 2] = (bits >>> 8) & 255;
  m[total - 1] = bits & 255;
  const w = new Uint32Array(64);
  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = (m[off + i * 4] << 24) | (m[off + i * 4 + 1] << 16) | (m[off + i * 4 + 2] << 8) | m[off + i * 4 + 3];
    for (let i = 16; i < 64; i++) {
      const a = w[i - 15], b = w[i - 2];
      const s0 = ((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3);
      const s1 = ((b >>> 17) | (b << 15)) ^ ((b >>> 19) | (b << 13)) ^ (b >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + SHA_K[i] + w[i]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0; h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + hh) | 0;
  }
  const out = new Uint8Array(32);
  for (let i = 0; i < 8; i++) { out[i * 4] = h[i] >>> 24; out[i * 4 + 1] = (h[i] >>> 16) & 255; out[i * 4 + 2] = (h[i] >>> 8) & 255; out[i * 4 + 3] = h[i] & 255; }
  return out;
}

const RMD_RL = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15, 7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8, 3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12, 1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2, 4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13];
const RMD_RR = [5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12, 6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2, 15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13, 8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14, 12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11];
const RMD_SL = [11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8, 7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12, 11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5, 11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12, 9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6];
const RMD_SR = [8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6, 9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11, 9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5, 15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8, 8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11];
const RMD_KL = [0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e];
const RMD_KR = [0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0x00000000];

function ripemd160(bytes) {
  const rol = (x, n) => (x << n) | (x >>> (32 - n));
  const f = (j, x, y, z) => (j < 16 ? x ^ y ^ z : j < 32 ? (x & y) | (~x & z) : j < 48 ? (x | ~y) ^ z : j < 64 ? (x & z) | (y & ~z) : x ^ (y | ~z));
  const len = bytes.length;
  const total = (((len + 9 + 63) >> 6) << 6);
  const m = new Uint8Array(total);
  m.set(bytes);
  m[len] = 0x80;
  const bits = len * 8;
  m[total - 8] = bits & 255; m[total - 7] = (bits >>> 8) & 255; m[total - 6] = (bits >>> 16) & 255; m[total - 5] = (bits >>> 24) & 255;
  let h0 = 0x67452301, h1 = 0xefcdab89 | 0, h2 = 0x98badcfe | 0, h3 = 0x10325476, h4 = 0xc3d2e1f0 | 0;
  const x = new Int32Array(16);
  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) x[i] = m[off + i * 4] | (m[off + i * 4 + 1] << 8) | (m[off + i * 4 + 2] << 16) | (m[off + i * 4 + 3] << 24);
    let al = h0, bl = h1, cl = h2, dl = h3, el = h4;
    let ar = h0, br = h1, cr = h2, dr = h3, er = h4;
    for (let j = 0; j < 80; j++) {
      const r = (j / 16) | 0;
      let t = (rol((al + f(j, bl, cl, dl) + x[RMD_RL[j]] + RMD_KL[r]) | 0, RMD_SL[j]) + el) | 0;
      al = el; el = dl; dl = rol(cl, 10); cl = bl; bl = t;
      t = (rol((ar + f(79 - j, br, cr, dr) + x[RMD_RR[j]] + RMD_KR[r]) | 0, RMD_SR[j]) + er) | 0;
      ar = er; er = dr; dr = rol(cr, 10); cr = br; br = t;
    }
    const t = (h1 + cl + dr) | 0;
    h1 = (h2 + dl + er) | 0; h2 = (h3 + el + ar) | 0; h3 = (h4 + al + br) | 0; h4 = (h0 + bl + cr) | 0; h0 = t;
  }
  const out = new Uint8Array(20);
  [h0, h1, h2, h3, h4].forEach((v, i) => { out[i * 4] = v & 255; out[i * 4 + 1] = (v >>> 8) & 255; out[i * 4 + 2] = (v >>> 16) & 255; out[i * 4 + 3] = (v >>> 24) & 255; });
  return out;
}

const toHex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (hex) => Uint8Array.from(hex.match(/../g) || [], (b) => parseInt(b, 16));
const utf8 = (text) => new TextEncoder().encode(text);
const hash256 = (bytes) => sha256(sha256(bytes));
const hash160 = (bytes) => ripemd160(sha256(bytes));

function compute(key, bytes) {
  if (key === 'sha256') return sha256(bytes);
  if (key === 'hash256') return hash256(bytes);
  if (key === 'ripemd160') return ripemd160(bytes);
  return hash160(bytes);
}

const bitsOf = (bytes) => {
  const out = [];
  bytes.forEach((b) => { for (let i = 7; i >= 0; i--) out.push((b >> i) & 1); });
  return out;
};

function changeLast(text) {
  const chars = Array.from(text);
  const last = chars.pop();
  return chars.join('') + String.fromCodePoint(last.codePointAt(0) + 1);
}

const css = `
.hl { container-type: inline-size; margin: 20px 0; display: flex; flex-direction: column; gap: 12px; color: var(--wd-text); font-size: 13px; }
.hl * { box-sizing: border-box; }
.hl-hint { margin: 0; color: var(--wd-text-muted); }
.hl-panel { display: flex; flex-direction: column; gap: 10px; padding: 14px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); }
.hl-field { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 10px; }
.hl-label { color: var(--wd-text-muted); font-size: 12px; }
.hl-in { width: 100%; padding: 6px 10px; border: 1px solid var(--wd-border); border-radius: 8px; background: var(--wd-background); color: var(--wd-text); font: inherit; font-size: 14px; }
.hl-in:focus-visible, .hl-row:focus-visible, .hl-sw:focus-visible { outline: 2px solid var(--wd-primary); outline-offset: 2px; }
.hl-rows { display: flex; flex-direction: column; gap: 4px; }
.hl-row { display: grid; grid-template-columns: 92px minmax(0, 1fr); align-items: center; gap: 10px; width: 100%; padding: 6px 10px; border: 1px solid transparent; border-radius: 9px; background: transparent; color: var(--wd-text); font: inherit; text-align: left; cursor: pointer; transition: background-color 0.2s ease, border-color 0.2s ease; }
.hl-row:hover { background: color-mix(in srgb, var(--wd-primary) 5%, transparent); }
.hl-row[aria-pressed="true"] { border-color: color-mix(in srgb, var(--wd-primary) 55%, var(--wd-border)); background: color-mix(in srgb, var(--wd-primary) 8%, var(--wd-background)); }
.hl-name { font-weight: 600; }
.hl-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; line-height: 1.35; overflow-wrap: anywhere; color: var(--wd-text-muted); }
.hl-row[aria-pressed="true"] .hl-mono { color: var(--wd-text); }
.hl-diff { color: #d6455d; font-weight: 700; }
.hl-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 14px; }
.hl-sw { display: inline-flex; align-items: center; gap: 8px; padding: 0; border: 0; background: transparent; color: var(--wd-text); font: inherit; cursor: pointer; }
.hl-sw:disabled { opacity: 0.5; cursor: default; }
.hl-track { position: relative; width: 30px; height: 17px; border-radius: 999px; background: color-mix(in srgb, var(--wd-text-muted) 35%, transparent); transition: background-color 0.2s ease; }
.hl-track::after { content: ''; position: absolute; top: 2px; left: 2px; width: 13px; height: 13px; border-radius: 50%; background: var(--wd-background); transition: transform 0.2s ease; }
.hl-sw[aria-checked="true"] .hl-track { background: var(--wd-primary); }
.hl-sw[aria-checked="true"] .hl-track::after { transform: translateX(13px); }
.hl-count { color: var(--wd-text-muted); font-size: 12px; }
.hl-count code { padding: 1px 7px; border-radius: 6px; background: color-mix(in srgb, var(--wd-primary) 9%, var(--wd-surface)); color: var(--wd-text); }
.hl-grid { display: grid; grid-template-columns: repeat(32, minmax(0, 1fr)); gap: 2px; }
.hl-cell { aspect-ratio: 1; border-radius: 2px; background: color-mix(in srgb, var(--wd-text-muted) 14%, transparent); transition: background-color 0.2s ease; }
.hl-cell[data-on="true"] { background: color-mix(in srgb, var(--wd-primary) 70%, transparent); }
.hl-cell[data-diff="true"] { background: #d6455d; }
.hl-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@container (max-width: 560px) {
  .hl-row { grid-template-columns: 1fr; gap: 2px; }
}
@media (prefers-reduced-motion: reduce) {
  .hl-row, .hl-cell, .hl-track, .hl-track::after { transition: none; }
}
`;

function HexLine({ a, b }) {
  if (!b) return <span className="hl-mono">{a}</span>;
  return (
    <span className="hl-mono">
      {a.split('').map((ch, i) => (ch === b[i] ? ch : <span key={i} className="hl-diff">{ch}</span>))}
    </span>
  );
}

export default function HashLab() {
  const [text, setText] = useState('abc');
  const [fn, setFn] = useState('sha256');
  const [changed, setChanged] = useState(false);

  const bytes = utf8(text);
  const has = text.length > 0;
  const edited = has ? changeLast(text) : '';
  const editedBytes = utf8(edited);
  const meta = copy.functions.find((f) => f.key === fn);
  const baseBits = bitsOf(compute(fn, bytes));
  const newBits = has ? bitsOf(compute(fn, editedBytes)) : baseBits;
  const diffCount = baseBits.reduce((n, bit, i) => n + (bit !== newBits[i] ? 1 : 0), 0);
  const on = changed && has;

  return (
    <div className="hl" role="group" aria-label="A hash lab: the SHA-256, HASH256, RIPEMD-160 and HASH160 of the text you type, and how many bits change when you change one character">
      <style>{css}</style>
      <p className="hl-hint">{copy.hint}</p>

      <div className="hl-panel">
        <label className="hl-field">
          <span className="hl-label">{copy.input}</span>
          <input className="hl-in" value={text} maxLength={60} onChange={(e) => setText(e.target.value)} spellCheck={false} />
        </label>

        {has ? (
          <div className="hl-rows">
            {copy.functions.map((f) => (
              <button key={f.key} type="button" className="hl-row" aria-pressed={fn === f.key} onClick={() => setFn(f.key)}>
                <span className="hl-name">{f.name}</span>
                <HexLine a={toHex(compute(f.key, bytes))} b={on && fn === f.key ? toHex(compute(f.key, editedBytes)) : null} />
              </button>
            ))}
          </div>
        ) : (
          <p className="hl-count">{copy.empty}</p>
        )}

        <div className="hl-bar">
          <button type="button" className="hl-sw" role="switch" aria-checked={changed} disabled={!has} onClick={() => setChanged(!changed)}>
            <span className="hl-track" aria-hidden="true" />
            <span>{copy.change}</span>
          </button>
          <span className="hl-count">
            {on ? <><span>{meta.name} of "{text}" and "{edited}": </span><code>{diffCount} of {meta.bits} bits changed</code></> : <span>{meta.name}, one square per bit</span>}
          </span>
        </div>

        <div className="hl-grid" aria-hidden="true">
          {baseBits.map((bit, i) => (
            <span key={i} className="hl-cell" data-on={!on && bit === 1} data-diff={on && bit !== newBits[i]} />
          ))}
        </div>
      </div>
      <span className="hl-sr" aria-live="polite">{on ? `${diffCount} of ${meta.bits} bits changed in ${meta.name}.` : ''}</span>
    </div>
  );
}
