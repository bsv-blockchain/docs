// Try BSV in your browser: look up a testnet transaction and inspect its BEEF, with nothing installed and no wallet.
// @bsv/sdk loads from a CDN on the first click (a runtime import, never at build time). Data comes from the WhatsOnChain testnet API.
// Tested with @bsv/sdk 3.2.1 and Chrome 155, 2026-10-22.
import { useState } from 'react';

const SDK_URL = 'https://esm.sh/@bsv/sdk@3.2.1';
const WOC = 'https://api.whatsonchain.com/v1/bsv/test';
const EXAMPLE = 'ec987d5123479405a00ff0e0c0583d2ae8339c62871dc6ca5a467cd234ae7716';

let sdkPromise;
const loadSdk = () => (sdkPromise ??= import(/* @vite-ignore */ SDK_URL));

async function get(url, as) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`WhatsOnChain answered ${response.status}. Check that the ID is a testnet transaction.`);
  return as === 'json' ? response.json() : (await response.text()).trim();
}

// Builds the BEEF from documented WhatsOnChain endpoints: the raw transaction and its merkle proof (TSC format), converted to a MerklePath.
async function beefFor(sdk, id) {
  const info = await get(`${WOC}/tx/hash/${id}`, 'json');
  if (!info.blockheight) throw new Error('This transaction is not in a block yet. Try again after its first confirmation.');
  const tx = sdk.Transaction.fromHex(await get(`${WOC}/tx/${id}/hex`));
  const [proof] = await get(`${WOC}/tx/${id}/proof/tsc`, 'json');
  tx.merklePath = new sdk.MerklePath(info.blockheight, proof.nodes.map((hash, level) => {
    const offset = (proof.index >> level) ^ 1;
    const sibling = hash === '*' ? { offset, duplicate: true } : { offset, hash };
    return level === 0 ? [{ offset: proof.index, hash: id, txid: true }, sibling].sort((x, y) => x.offset - y.offset) : [sibling];
  }));
  return tx.toHexBEEF();
}

function Rows({ rows }) {
  return (
    <dl className="m-0 grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-[11rem_1fr]">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="m-0 font-semibold text-gray-900 dark:text-gray-100">{label}</dt>
          <dd className="m-0 break-all text-gray-700 dark:text-gray-300">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function TryIt() {
  const [txid, setTxid] = useState(EXAMPLE);
  const [busy, setBusy] = useState(false);
  const [tx, setTx] = useState(null);
  const [beef, setBeef] = useState(null);
  const [error, setError] = useState(null);

  const run = (fn) => async () => {
    setBusy(true); setError(null); setTx(null); setBeef(null);
    try { await fn(txid.trim()); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const lookUp = run(async (id) => {
    const info = await get(`${WOC}/tx/hash/${id}`, 'json');
    setTx([
      ['Block', info.blockheight ? `${info.blockheight} (${info.confirmations} confirmations)` : 'Not in a block yet'],
      ['Size', `${info.size} bytes`],
      ['Outputs (satoshis)', info.vout.map((o) => Math.round(o.value * 1e8)).join(', ')],
    ]);
  });

  const inspect = run(async (id) => {
    const sdk = await loadSdk();
    const hex = await beefFor(sdk, id);
    const parsed = sdk.Transaction.fromHexBEEF(hex);
    let check;
    try {
      // verify() returns true, and throws on a bad merkle proof or script, so both failures read as "Not valid".
      check = (await parsed.verify(new sdk.WhatsOnChain('test'))) === true ? 'Valid' : 'Not valid';
    } catch (e) {
      check = `Not valid (${e.message})`;
    }
    setBeef([
      ['BEEF', `${sdk.Beef.fromString(hex, 'hex').version === 0xefbe0001 ? 'Version 1 (BRC-62)' : 'Version 2 (BRC-95)'}, ${hex.length / 2} bytes`],
      ['Transaction ID', <code key="id">{parsed.id('hex')}</code>],
      ['Inputs', parsed.inputs.map((i) => <code key={i.sourceTXID} className="block">{`${i.sourceTXID ?? i.sourceTransaction.id('hex')}:${i.sourceOutputIndex}`}</code>)],
      ['Outputs (satoshis)', parsed.outputs.map((o) => o.satoshis).join(', ')],
      ['SPV check', check],
    ]);
  });

  const button = 'rounded-lg bg-[#1B1EA9] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-[#8C9BFF] dark:text-gray-900';

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="bg-[#1B1EA9] px-4 py-3 text-white dark:bg-[#8C9BFF] dark:text-gray-900">
        <span className="text-sm font-semibold">Try it: a testnet transaction</span>
      </div>
      <div className="space-y-4 px-4 py-4">
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
          Testnet transaction ID
          <input
            value={txid}
            onChange={(e) => setTxid(e.target.value)}
            spellCheck={false}
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 font-mono text-sm font-normal dark:border-gray-600"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={lookUp} disabled={busy} className={button}>Look up</button>
          <button type="button" onClick={inspect} disabled={busy} className={button}>Inspect BEEF</button>
          {busy && <span className="text-sm text-gray-700 dark:text-gray-300">Loading...</span>}
        </div>
        {error && <p role="alert" className="m-0 text-sm text-red-700 dark:text-red-400">{error}</p>}
        {tx && <Rows rows={tx} />}
        {beef && <Rows rows={beef} />}
      </div>
    </figure>
  );
}
