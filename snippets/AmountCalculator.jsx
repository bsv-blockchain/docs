// Example React snippet: interactive in the reader's browser.
// Converts a price into the `amount` value the API expects (smallest currency unit).
// Used in docs/guides/first-request.mdx and docs/writing/snippets.mdx.
import { useState } from 'react';

const DECIMALS = { USD: 2, EUR: 2, BRL: 2, JPY: 0 };

export default function AmountCalculator({ currency = 'USD', initial = '25.00' }) {
  const [value, setValue] = useState(initial);
  const [cur, setCur] = useState(currency);

  const decimals = DECIMALS[cur] ?? 2;
  const number = Number(value.replace(',', '.'));
  const amount = Number.isFinite(number) ? Math.round(number * 10 ** decimals) : null;

  const box = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    margin: '16px 0',
    border: '1px solid var(--wd-border)',
    borderRadius: 12,
    background: 'var(--wd-surface)',
  };
  const field = {
    padding: '8px 10px',
    border: '1px solid var(--wd-border)',
    borderRadius: 8,
    background: 'var(--wd-background)',
    color: 'var(--wd-text)',
    font: 'inherit',
  };

  return (
    <div style={box}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        Price
        <input style={{ ...field, width: 110 }} value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" />
      </label>
      <select style={field} value={cur} onChange={(e) => setCur(e.target.value)} aria-label="Currency">
        {Object.keys(DECIMALS).map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <span style={{ color: 'var(--wd-text-muted)' }}>→</span>
      <code>{amount === null ? 'not a number' : `"amount": ${amount}, "currency": "${cur}"`}</code>
    </div>
  );
}
