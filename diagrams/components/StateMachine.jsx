"use client";
/**
 * StateMachine — interactive lifecycle diagram for documentation portals.
 * Kit file (diagram kit 1.0.0). Styling comes from diagram-theme.css + diagram-components.css.
 *
 * Usage (MDX):
 *   import data from "@/diagrams/data/payment-states.json";
 *   <StateMachine data={data} />
 *
 * Props
 *   data          state machine definition (see diagrams/data/example-payment-states.json)
 *   initial       optional id of the group or state selected on load
 *   showStates    "always" | "selected" (default "always"): show substates on every card or only on the selected one
 *   minColumnWidth  px width below which the layout switches to a stacked list (default 150)
 *
 * No dependencies besides React. Works with React 17+.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const StateMachine = ({ data, initial = null, showStates = "always", minColumnWidth = 150 }) => {
  const uid = useMemo(() => `dgsm-${data.id}`, [data.id]);
  const groups = useMemo(
    () => [...data.groups].sort((a, b) => a.column - b.column || a.order - b.order),
    [data.groups]
  );
  const byId = useMemo(() => Object.fromEntries(groups.map((g) => [g.id, g])), [groups]);
  const stateIndex = useMemo(() => {
    const idx = {};
    for (const g of groups) for (const s of g.states ?? []) idx[s.id] = { state: s, group: g };
    return idx;
  }, [groups]);

  const [selected, setSelected] = useState(initial);
  const [stacked, setStacked] = useState(false);
  const [edges, setEdges] = useState([]);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const wrapRef = useRef(null);
  const gridRef = useRef(null);
  const nodeRefs = useRef({});

  const selectedGroupId = selected ? (byId[selected] ? selected : stateIndex[selected]?.group.id ?? null) : null;
  const selectedGlobal = data.global?.find((g) => g.id === selected) ?? null;

  const outgoing = (id) => data.transitions.filter((t) => t.from === id);
  const incoming = (id) => data.transitions.filter((t) => t.to === id);
  const related = useMemo(() => {
    if (!selectedGroupId) return null;
    const set = new Set([selectedGroupId]);
    data.transitions.forEach((t) => {
      if (t.from === selectedGroupId) set.add(t.to);
      if (t.to === selectedGroupId) set.add(t.from);
    });
    return set;
  }, [selectedGroupId, data.transitions]);

  // Decide between grid and stacked layout based on available width.
  useIsoLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      setStacked(entry.contentRect.width < data.columns * minColumnWidth);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [data.columns, minColumnWidth]);

  // Measure card positions and compute connector paths.
  useIsoLayoutEffect(() => {
    if (stacked) return setEdges([]);
    const grid = gridRef.current;
    if (!grid) return;
    const measure = () => {
      const g = grid.getBoundingClientRect();
      setBox({ w: g.width, h: g.height });
      const rect = (id) => {
        const el = nodeRefs.current[id];
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { l: r.left - g.left, r: r.right - g.left, t: r.top - g.top, b: r.bottom - g.top, cx: r.left - g.left + r.width / 2, cy: r.top - g.top + r.height / 2 };
      };
      const out = [];
      for (const tr of data.transitions) {
        const a = rect(tr.from), b = rect(tr.to);
        const ga = byId[tr.from], gb = byId[tr.to];
        if (!a || !b || !ga || !gb) continue;
        let d, lx, ly;
        if (gb.column > ga.column) {
          const x1 = a.r, y1 = a.cy, x2 = b.l - 2, y2 = b.cy, k = Math.max(24, (x2 - x1) / 2);
          d = `M${x1},${y1} C${x1 + k},${y1} ${x2 - k},${y2} ${x2},${y2}`;
          [lx, ly] = [(x1 + x2) / 2, (y1 + y2) / 2];
        } else if (gb.column === ga.column) {
          const down = b.t > a.t;
          const x = a.cx, y1 = down ? a.b : a.t, y2 = down ? b.t - 2 : b.b + 2;
          d = `M${x},${y1} L${x},${y2}`;
          [lx, ly] = [x + 6, (y1 + y2) / 2];
        } else {
          // Backward edge: leave the source's left side near its top, enter the target's right side near its top,
          // so it never overlaps the forward edge that uses the vertical centers.
          const x1 = a.l, y1 = a.t + Math.min(22, (a.b - a.t) / 3);
          const x2 = b.r + 2, y2 = b.t + Math.min(22, (b.b - b.t) / 3);
          const k = Math.max(20, (x1 - x2) / 2);
          d = `M${x1},${y1} C${x1 - k},${y1} ${x2 + k},${y2} ${x2},${y2}`;
          [lx, ly] = [(x1 + x2) / 2 - 8, Math.min(y1, y2) - 6];
        }
        out.push({ ...tr, d, lx, ly });
      }
      setEdges(out);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(grid);
    return () => ro.disconnect();
  }, [stacked, data.transitions, byId, selected, showStates]);

  const toggle = (id) => setSelected((cur) => (cur === id ? null : id));
  const dim = (id) => related && !related.has(id);

  const columns = useMemo(() => {
    const cols = Array.from({ length: data.columns }, () => []);
    groups.forEach((g) => cols[g.column]?.push(g));
    return cols;
  }, [groups, data.columns]);

  const renderGroup = (g) => {
    const showSubs = showStates === "always" || selectedGroupId === g.id;
    const isSel = selected === g.id;
    return (
      <div
        key={g.id}
        ref={(el) => (nodeRefs.current[g.id] = el)}
        className="dgsm-group"
        data-status={g.status}
        data-selected={selectedGroupId === g.id || undefined}
        data-dim={dim(g.id) || undefined}
      >
        <button type="button" className="dgsm-group-head" aria-pressed={isSel} onClick={() => toggle(g.id)}>
          <span className="dgsm-group-label">{g.label}</span>
          {g.terminal ? <span className="dgsm-terminal" title="Final status">Final</span> : null}
        </button>
        {g.states?.length && showSubs ? (
          <ul className="dgsm-states" aria-label={`${g.label} substatuses`}>
            {g.states.map((s) => (
              <li key={s.id}>
                <button type="button" className="dgsm-state" aria-pressed={selected === s.id} onClick={() => toggle(s.id)}>
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        ) : g.states?.length ? (
          <span className="dgsm-count">{g.states.length} substatuses</span>
        ) : null}
      </div>
    );
  };

  const Detail = () => {
    if (selectedGlobal) {
      return (
        <>
          <p className="dgsm-detail-title"><span className="dgsm-badge" data-status={selectedGlobal.status}>{selectedGlobal.label}</span></p>
          <p className="dgsm-api"><code>{data.apiFields?.group ?? "status"}: "{selectedGlobal.apiValue}"</code></p>
          <p>{selectedGlobal.description}</p>
        </>
      );
    }
    if (!selectedGroupId) return <p className="dgsm-hint">Select a status or substatus to see its details and transitions.</p>;
    const g = byId[selectedGroupId];
    const sub = stateIndex[selected]?.state ?? null;
    const outs = outgoing(g.id), ins = incoming(g.id);
    const Links = ({ list, key2 }) => (
      <ul className="dgsm-links">
        {list.map((t) => {
          const target = byId[t[key2]];
          return (
            <li key={t.from + t.to}>
              <button type="button" className="dgsm-badge" data-status={target.status} onClick={() => setSelected(target.id)}>
                {target.label}
              </button>
              {t.label ? <span className="dgsm-edge-note">{t.label}</span> : null}
            </li>
          );
        })}
      </ul>
    );
    return (
      <>
        <p className="dgsm-detail-title">
          <span className="dgsm-badge" data-status={g.status}>{g.label}</span>
          {sub ? <span className="dgsm-sub-title">{sub.label}</span> : null}
        </p>
        <p className="dgsm-api">
          <code>{data.apiFields?.group ?? "status"}: "{g.apiValue}"</code>
          {sub ? <code>{data.apiFields?.state ?? "substatus"}: "{sub.apiValue}"</code> : null}
        </p>
        <p>{sub ? sub.description : g.description}</p>
        {g.terminal ? <p className="dgsm-note">This is a final status. The payment does not move to another status.</p> : null}
        {outs.length ? (<><p className="dgsm-subhead">Can move to</p><Links list={outs} key2="to" /></>) : null}
        {ins.length ? (<><p className="dgsm-subhead">Reached from</p><Links list={ins} key2="from" /></>) : null}
      </>
    );
  };

  return (
    <figure className="dgsm" aria-labelledby={`${uid}-title`}>
      <figcaption className="dgsm-caption">
        <span id={`${uid}-title`} className="dgsm-title">{data.title}</span>
        {data.summary ? <span className="dgsm-summary">{data.summary}</span> : null}
      </figcaption>

      <div ref={wrapRef} className="dgsm-scroll">
        <div
          ref={gridRef}
          className={stacked ? "dgsm-grid dgsm-stacked" : "dgsm-grid"}
          style={stacked ? undefined : { gridTemplateColumns: `repeat(${data.columns}, minmax(${minColumnWidth - 20}px, 1fr))` }}
        >
          {!stacked && edges.length ? (
            <svg className="dgsm-edges" width={box.w} height={box.h} aria-hidden="true">
              <defs>
                <marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" className="dgsm-arrowhead" />
                </marker>
                <marker id={`${uid}-arrow-on`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" className="dgsm-arrowhead dgsm-on" />
                </marker>
              </defs>
              {edges.map((e) => {
                const on = selectedGroupId && (e.from === selectedGroupId || e.to === selectedGroupId);
                const off = selectedGroupId && !on;
                return (
                  <g key={e.from + e.to} className={on ? "dgsm-edge dgsm-on" : off ? "dgsm-edge dgsm-off" : "dgsm-edge"}>
                    <path d={e.d} markerEnd={`url(#${uid}-arrow${on ? "-on" : ""})`} />
                    {e.label ? <text x={e.lx} y={e.ly}>{e.label}</text> : null}
                  </g>
                );
              })}
            </svg>
          ) : null}
          {stacked
            ? groups.map(renderGroup)
            : columns.map((col, i) => (
                <div key={i} className="dgsm-col">{col.map(renderGroup)}</div>
              ))}
        </div>
      </div>

      {data.global?.length ? (
        <div className="dgsm-global">
          {data.global.map((g) => (
            <div key={g.id} className="dgsm-global-row">
              <span className="dgsm-global-line" aria-hidden="true" />
              <button type="button" className="dgsm-badge" data-status={g.status} aria-pressed={selected === g.id} onClick={() => toggle(g.id)}>
                {g.label}
              </button>
              <span className="dgsm-global-text">{g.description}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="dgsm-detail" aria-live="polite">
        <Detail />
      </div>
    </figure>
  );
};

export default StateMachine;
