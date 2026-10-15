// Sequence diagram for "Pay from a web app": who talks to whom, top to bottom.
// Content only: edit actors and messages here. Tested on BSV Desktop 3.1.1, 2026-10-15.
const actors = ['Faucet', 'Your script', 'BSV Desktop', 'Testnet'];

// from and to are indexes in actors. The same index draws a note on that actor.
const messages = [
  { from: 0, to: 2, text: 'Sends free testnet coins' },
  { from: 1, to: 2, text: <><code>connect.mjs</code> reads the identity key and network</> },
  { from: 1, to: 2, text: <><code>pay.mjs</code> asks for a payment with <code>createAction</code></> },
  { from: 2, to: 2, text: <>You click <strong>Authorize</strong>, the wallet signs</> },
  { from: 2, to: 3, text: 'Sends the payment' },
  { from: 2, to: 1, text: 'Returns the transaction ID' },
  { from: 1, to: 3, text: 'You open the explorer link to see the payment' },
];

const n = actors.length;

function Message({ from, to, text, step }) {
  const left = Math.min(from, to);
  const right = Math.max(from, to);
  const span = right - left + 1;
  const edge = `${50 / span}%`;
  const self = from === to;
  const toRight = to > from;
  return (
    <div className="relative py-2" style={{ gridColumn: `${left + 1} / span ${span}` }}>
      {self ? (
        <div className="relative z-10 mx-auto w-[90%] rounded-lg bg-white dark:bg-gray-900 border border-dashed border-[#1B1EA9] px-2 py-1 text-center text-xs dark:border-[#8C9BFF]">
          <span className="mr-1 font-semibold text-[#1B1EA9] dark:text-[#8C9BFF]">{step}</span>{text}
        </div>
      ) : (
        <div style={{ marginLeft: edge, marginRight: edge }}>
          <p className="relative z-10 m-0 mb-1 text-center text-xs"><span className="bg-white px-1 dark:bg-gray-900">
            <span className="mr-1 font-semibold text-[#1B1EA9] dark:text-[#8C9BFF]">{step}</span>{text}</span>
          </p>
          <div className="relative h-0 border-t-2 border-[#1B1EA9] dark:border-[#8C9BFF]">
            <span
              className={`absolute -top-[7px] h-0 w-0 border-y-[6px] border-y-transparent ${toRight ? '-right-1 border-l-[8px] border-l-[#1B1EA9] dark:border-l-[#8C9BFF]' : '-left-1 border-r-[8px] border-r-[#1B1EA9] dark:border-r-[#8C9BFF]'}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentSequence() {
  return (
    <figure className="not-prose my-6 overflow-x-auto rounded-xl border border-gray-200 p-4 dark:border-gray-700" aria-label="Sequence of requests between the faucet, your script, BSV Desktop and the testnet">
      <div className="relative grid min-w-[560px] gap-x-2" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {actors.map((a, i) => (
          <div key={a} className="pointer-events-none absolute bottom-0 top-10 border-l border-dashed border-gray-300 dark:border-gray-600" style={{ left: `${((i + 0.5) / n) * 100}%` }} />
        ))}
        {actors.map((a) => (
          <div key={a} className="relative z-10 mb-2 rounded-lg bg-[#1B1EA9] px-2 py-2 text-center text-sm font-semibold text-white dark:bg-[#8C9BFF] dark:text-gray-900">{a}</div>
        ))}
        {messages.map((m, i) => (
          <Message key={i} {...m} step={i + 1} />
        ))}
      </div>
      <figcaption className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">Read from top to bottom. Numbers follow the order of the tutorial.</figcaption>
    </figure>
  );
}
