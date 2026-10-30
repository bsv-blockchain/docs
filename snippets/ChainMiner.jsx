import { useState, useRef } from 'react';

// Content only: edit the text here, the layout below does not need to change.
// Three blocks with a real 80 byte header (version, previous hash, Merkle root, time, bits, nonce) and a real double SHA-256.
// The Merkle root of each block is the double SHA-256 of the text typed in it, a stand-in for a list of transactions.
// The target is "the hash starts with N zero hex digits", the same rule as a numeric target of 2^(256 - 4N). Bits is its compact form.

const copy = {
  hint: 'Edit a block, then mine it. Every block after it breaks.',
  target: 'Target',
  options: [
    { key: 2, label: '2' },
    { key: 3, label: '3' },
    { key: 4, label: '4' },
  ],
  targetUnit: 'leading zeros',
  tx: 'Transactions',
  root: 'Merkle root',
  prev: 'Previous hash',
  nonce: 'Nonce',
  hash: 'Hash',
  ok: 'Valid',
  bad: 'Above target',
  mine: 'Mine',
  mining: 'Mining',
  reset: 'Reset',
  attempts: 'Hashes tried',
  bits: 'Bits',
};

const START = ['John pays Jane 5', 'Jane pays John 2', 'John pays Jane 1'];
const TIME = 1231006505;
const BITS = { 2: 0x20010000, 3: 0x1f100000, 4: 0x1f010000 };
const ZERO = '0'.repeat(64);

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

const le32 = (n) => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255];
const reverse = (bytes) => Uint8Array.from(bytes).reverse();
const rootOf = (text) => toHex(reverse(hash256(utf8(text))));

function headerHash(prev, root, bits, nonce) {
  const header = new Uint8Array(80);
  header.set(le32(1), 0);
  header.set(reverse(fromHex(prev)), 4);
  header.set(reverse(fromHex(root)), 36);
  header.set(le32(TIME), 68);
  header.set(le32(bits), 72);
  header.set(le32(nonce), 76);
  return toHex(reverse(hash256(header)));
}

const zerosOf = (hash) => hash.match(/^0*/)[0].length;

function findNonce(prev, root, bits, k, from, limit) {
  for (let n = from; n < from + limit; n++) {
    if (zerosOf(headerHash(prev, root, bits, n)) >= k) return n;
  }
  return -1;
}

function chainFor(blocks, k) {
  const bits = BITS[k];
  const out = [];
  let prev = ZERO;
  blocks.forEach((b) => {
    const root = rootOf(b.tx);
    const hash = headerHash(prev, root, bits, b.nonce);
    out.push({ prev, root, hash, valid: zerosOf(hash) >= k });
    prev = hash;
  });
  return out;
}

function mineStart() {
  const bits = BITS[3];
  const blocks = [];
  let prev = ZERO;
  START.forEach((tx) => {
    const root = rootOf(tx);
    const nonce = findNonce(prev, root, bits, 3, 0, 5000000);
    blocks.push({ tx, nonce });
    prev = headerHash(prev, root, bits, nonce);
  });
  return blocks;
}

const css = `
.cm { container-type: inline-size; margin: 20px 0; display: flex; flex-direction: column; gap: 12px; color: var(--wd-text); font-size: 13px; }
.cm * { box-sizing: border-box; }
.cm-top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px; }
.cm-hint { margin: 0; color: var(--wd-text-muted); }
.cm-ctrl { display: inline-flex; align-items: center; gap: 8px; color: var(--wd-text-muted); }
.cm-seg { display: inline-grid; grid-auto-flow: column; padding: 2px; border: 1px solid var(--wd-border); border-radius: 999px; background: var(--wd-surface); }
.cm-opt { min-width: 30px; padding: 3px 10px; border: 0; border-radius: 999px; background: transparent; color: var(--wd-text-muted); font: inherit; font-weight: 600; cursor: pointer; transition: color 0.2s ease, background-color 0.2s ease; }
.cm-opt[aria-pressed="true"] { background: var(--wd-primary); color: var(--wd-background); }
.cm-opt:disabled, .cm-btn:disabled { opacity: 0.5; cursor: default; }
.cm-opt:focus-visible, .cm-btn:focus-visible, .cm-in:focus-visible { outline: 2px solid var(--wd-primary); outline-offset: 2px; }
.cm-chain { display: grid; grid-template-columns: minmax(0, 1fr) 22px minmax(0, 1fr) 22px minmax(0, 1fr); align-items: center; }
.cm-block { display: flex; flex-direction: column; gap: 8px; padding: 12px; border: 1px solid var(--wd-border); border-left: 3px solid var(--cm-edge); border-radius: 12px; background: var(--wd-surface); transition: border-color 0.3s ease; }
.cm-block[data-valid="true"] { --cm-edge: #3aa17a; }
.cm-block[data-valid="false"] { --cm-edge: #d6455d; }
.cm-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.cm-name { font-weight: 600; }
.cm-state { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--wd-text-muted); }
.cm-state::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: var(--cm-edge); }
.cm-in { width: 100%; padding: 5px 9px; border: 1px solid var(--wd-border); border-radius: 8px; background: var(--wd-background); color: var(--wd-text); font: inherit; }
.cm-rows { display: grid; grid-template-columns: auto 1fr; gap: 3px 10px; margin: 0; }
.cm-rows dt { color: var(--wd-text-muted); font-size: 11.5px; }
.cm-rows dd { margin: 0; text-align: right; }
.cm-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11.5px; }
.cm-hash { display: flex; align-items: baseline; justify-content: space-between; gap: 6px; padding: 6px 9px; border-radius: 8px; background: color-mix(in srgb, var(--wd-primary) 6%, var(--wd-background)); }
.cm-zero { color: #2f8f69; font-weight: 700; }
.cm-block[data-valid="false"] .cm-zero { color: var(--wd-text-muted); font-weight: 400; }
.cm-btn { padding: 3px 12px; border: 1px solid var(--wd-border); border-radius: 999px; background: var(--wd-background); color: var(--wd-text); font: inherit; font-weight: 600; cursor: pointer; transition: border-color 0.2s ease; }
.cm-btn:hover:not(:disabled) { border-color: var(--wd-primary); }
.cm-btn-main { background: var(--wd-primary); border-color: var(--wd-primary); color: var(--wd-background); }
.cm-arrow { position: relative; display: block; height: 10px; }
.cm-arrow::before { content: ''; position: absolute; left: 2px; right: 6px; top: 4px; height: 2px; border-radius: 2px; background: var(--cm-edge); }
.cm-arrow::after { content: ''; position: absolute; right: 1px; top: 1px; border: 4px solid transparent; border-left: 6px solid var(--cm-edge); border-right: 0; }
.cm-arrow[data-valid="true"] { --cm-edge: #3aa17a; }
.cm-arrow[data-valid="false"] { --cm-edge: #d6455d; }
.cm-bottom { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px 14px; color: var(--wd-text-muted); font-size: 12px; }
.cm-bottom code { padding: 1px 7px; border-radius: 6px; background: color-mix(in srgb, var(--wd-primary) 9%, var(--wd-surface)); color: var(--wd-text); }
.cm-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@container (max-width: 640px) {
  .cm-chain { grid-template-columns: 1fr; }
  .cm-arrow { width: 10px; height: 18px; margin: 0 auto; }
  .cm-arrow::before { left: 4px; right: auto; top: 0; bottom: 5px; width: 2px; height: auto; }
  .cm-arrow::after { right: auto; left: 1px; top: auto; bottom: 0; border: 4px solid transparent; border-top: 6px solid var(--cm-edge); border-bottom: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .cm-block, .cm-opt, .cm-btn { transition: none; }
}
`;

const short = (hex) => `${hex.slice(0, 6)}...${hex.slice(-4)}`;

function Hash({ hash }) {
  const lead = Math.min(zerosOf(hash), 64);
  const rest = hash.slice(lead);
  const room = Math.max(0, 14 - lead);
  return (
    <span className="cm-mono" title={hash}>
      <span className="cm-zero">{hash.slice(0, Math.min(lead, 14))}</span>
      {rest.slice(0, room)}...
    </span>
  );
}

export default function ChainMiner() {
  const [k, setK] = useState(3);
  const [blocks, setBlocks] = useState(mineStart);
  const [busy, setBusy] = useState(null);
  const [tries, setTries] = useState(0);
  const latest = useRef(blocks);
  latest.current = blocks;

  const chain = chainFor(blocks, k);
  const bits = BITS[k];

  const edit = (i, tx) => setBlocks((bs) => bs.map((b, j) => (j === i ? { ...b, tx } : b)));

  const mine = (i) => {
    if (busy !== null) return;
    setBusy(i);
    const c = chainFor(latest.current, k)[i];
    let n = 0;
    const step = () => {
      const found = findNonce(c.prev, c.root, bits, k, n, 4000);
      if (found >= 0) {
        setTries((t) => t + (found - n) + 1);
        setBlocks((bs) => bs.map((b, j) => (j === i ? { ...b, nonce: found } : b)));
        setBusy(null);
        return;
      }
      n += 4000;
      setTries((t) => t + 4000);
      setTimeout(step, 0);
    };
    setTimeout(step, 0);
  };

  const reset = () => {
    if (busy !== null) return;
    setK(3);
    setBlocks(mineStart());
    setTries(0);
  };

  return (
    <div className="cm" role="group" aria-label="A chain of three blocks. Edit the transactions of a block and mine it to see how the hash, the target and the link to the next block react.">
      <style>{css}</style>
      <div className="cm-top">
        <p className="cm-hint">{copy.hint}</p>
        <div className="cm-ctrl">
          <span id="cm-target">{copy.target}</span>
          <div className="cm-seg" role="group" aria-labelledby="cm-target">
            {copy.options.map((o) => (
              <button key={o.key} type="button" className="cm-opt" aria-pressed={k === o.key} disabled={busy !== null} onClick={() => setK(o.key)}>{o.label}</button>
            ))}
          </div>
          <span>{copy.targetUnit}</span>
        </div>
      </div>

      <div className="cm-chain">
        {blocks.map((b, i) => {
          const c = chain[i];
          return [
            i > 0 ? <span key={`a${i}`} className="cm-arrow" data-valid={c.valid} aria-hidden="true" /> : null,
            <div key={`b${i}`} className="cm-block" data-valid={c.valid}>
              <div className="cm-head">
                <span className="cm-name">Block {i + 1}</span>
                <span className="cm-state">{c.valid ? copy.ok : copy.bad}</span>
              </div>
              <input className="cm-in" value={b.tx} maxLength={40} disabled={busy !== null} onChange={(e) => edit(i, e.target.value)} aria-label={`${copy.tx} of block ${i + 1}`} />
              <dl className="cm-rows">
                <dt>{copy.root}</dt><dd className="cm-mono">{short(c.root)}</dd>
                <dt>{copy.prev}</dt><dd className="cm-mono">{i === 0 ? '0000...0000' : short(c.prev)}</dd>
                <dt>{copy.nonce}</dt><dd className="cm-mono">{b.nonce.toLocaleString('en-US')}</dd>
              </dl>
              <div className="cm-hash"><Hash hash={c.hash} /><button type="button" className="cm-btn cm-btn-main" disabled={busy !== null} onClick={() => mine(i)}>{busy === i ? copy.mining : copy.mine}</button></div>
            </div>,
          ];
        })}
      </div>

      <div className="cm-bottom">
        <span>{copy.bits} <code>0x{bits.toString(16)}</code></span>
        <span className="cm-ctrl">
          <span>{copy.attempts} <code>{tries.toLocaleString('en-US')}</code></span>
          <button type="button" className="cm-btn" disabled={busy !== null} onClick={reset}>{copy.reset}</button>
        </span>
      </div>
      <span className="cm-sr" aria-live="polite">{chain.every((c) => c.valid) ? 'All three blocks are valid.' : `${chain.filter((c) => !c.valid).length} of 3 blocks are above the target.`}</span>
    </div>
  );
}
