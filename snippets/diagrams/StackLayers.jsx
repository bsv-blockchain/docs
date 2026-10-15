// Content only: edit the lists below, the layout does not need to change.
// Source: docs/concepts/architecture.mdx. An optional `href` on a layer or chip makes it a link to a page or section.
// The page puts the same content in a <Visibility for="agents"> block above this component, because the markdown
// export leaves the component itself empty. When you change the text here, change it in that block too.
const top = {
  name: 'Application layer',
  note: 'Your app. It never touches a key.',
  chips: [{ label: '@bsv/simple/browser', code: true }, { label: '@bsv/simple/server', code: true }],
};
const boundary = {
  name: 'BRC-100 wallet interface',
  note: 'createAction, signAction, listOutputs, listActions, internalizeAction',
};
const toolkit = {
  name: 'Wallet toolkit',
  note: 'For developers building a wallet',
  chips: [
    { label: '@bsv/wallet-toolbox', code: true },
    { label: 'Storage providers' },
    { label: 'WalletSigner and Services' },
    { label: 'Monitor and key managers' },
  ],
};
const foundation = {
  name: 'Foundation: @bsv/sdk',
  note: 'Zero external dependencies, used by every layer above',
  chips: [
    { label: 'Cryptography' },
    { label: 'Script and transactions' },
    { label: 'BEEF and Merkle proofs' },
    { label: 'Key derivation and network' },
  ],
};

const css = `
.sl { container-type: inline-size; width: 100%; margin: 24px 0; color: var(--wd-text); font-size: 13px; }
.sl-layer { padding: 14px 16px 16px; border: 1px solid var(--wd-border); border-radius: 12px; background: var(--wd-surface); }
.sl-name { display: block; margin: 0; font-size: 15px; font-weight: 600; text-align: center; }
.sl-note { display: block; margin: 4px 0 0; text-align: center; color: var(--wd-text-muted); }
.sl-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 12px; }
.sl-chip { padding: 7px 12px; border: 1px solid var(--wd-border); border-radius: 8px; background: var(--wd-background); color: var(--wd-text-muted); text-align: center; }
.sl-chip[data-code="true"] { color: var(--wd-text); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; }
a.sl-chip, a.sl-name-link { text-decoration: none; }
a.sl-chip:hover, a.sl-chip:focus-visible { border-color: var(--wd-primary); color: var(--wd-text); }
.sl-boundary { width: max-content; max-width: 100%; margin: 0 auto; padding: 10px 16px; border: 2px dashed var(--wd-primary); border-radius: 10px; background: var(--wd-background); text-align: center; }
.sl-boundary .sl-name { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; }
.sl-arrow { position: relative; height: 28px; width: 2px; margin: 0 auto; background: var(--wd-text-muted); }
.sl-arrow::after { content: ''; position: absolute; left: 50%; bottom: -1px; transform: translateX(-50%); border: 5px solid transparent; border-top: 8px solid var(--wd-text-muted); border-bottom: 0; }
`;

const Chip = ({ chip }) => {
  const props = { className: 'sl-chip', 'data-code': chip.code ? 'true' : undefined };
  return chip.href ? <a {...props} href={chip.href}>{chip.label}</a> : <span {...props}>{chip.label}</span>;
};

const Layer = ({ layer }) => (
  <div className="sl-layer">
    <div className="sl-name">{layer.href ? <a className="sl-name-link" href={layer.href}>{layer.name}</a> : layer.name}</div>
    <div className="sl-note">{layer.note}</div>
    <div className="sl-chips">{layer.chips.map((c) => <Chip key={c.label} chip={c} />)}</div>
  </div>
);

export default function StackLayers() {
  return (
    <div className="sl" role="group" aria-label="The BSV stack, from the application layer at the top, through the BRC-100 wallet interface and the wallet toolkit, to @bsv/sdk at the bottom">
      <style>{css}</style>
      <Layer layer={top} />
      <div className="sl-arrow" aria-hidden="true" />
      <div className="sl-boundary">
        <div className="sl-name">{boundary.name}</div>
        <div className="sl-note">{boundary.note}</div>
      </div>
      <div className="sl-arrow" aria-hidden="true" />
      <Layer layer={toolkit} />
      <div className="sl-arrow" aria-hidden="true" />
      <Layer layer={foundation} />
    </div>
  );
}
