"use client";
/**
 * Mermaid — renders a Mermaid chart with the client theme and follows the portal's light/dark mode.
 * Kit file (diagram kit 1.0.0). Use on React-based portals that don't theme Mermaid globally (Fumadocs, Next, Nextra).
 * Docusaurus already themes Mermaid through docusaurus.config; Mintlify renders ```mermaid natively.
 *
 * Usage (MDX):
 *   import config from "@/diagrams/brand/generated/mermaid.config.json";
 *   <Mermaid config={config} chart={`sequenceDiagram
 *     Your server->>API: POST /v1/payments`} caption="Creating a payment" />
 *
 * Requires the `mermaid` package (npm i mermaid). Loaded lazily, only on pages that use it.
 */
import { useEffect, useId, useState } from "react";

const DARK_SELECTORS = [".dark", "[data-theme='dark']"];

const isDark = (selectors) =>
  typeof document !== "undefined" && selectors.some((s) => document.documentElement.matches(s) || document.body?.matches(s));

export const Mermaid = ({ chart, config, caption, darkSelectors = DARK_SELECTORS }) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(isDark(darkSelectors));
    const mo = new MutationObserver(() => setDark(isDark(darkSelectors)));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    if (document.body) mo.observe(document.body, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => mo.disconnect();
  }, [darkSelectors]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        const modeConfig = config ? config[dark ? "dark" : "light"] : { theme: dark ? "dark" : "default" };
        mermaid.initialize({ startOnLoad: false, securityLevel: "strict", ...modeConfig });
        const { svg } = await mermaid.render(`mmd-${id}-${dark ? "d" : "l"}`, chart.trim());
        if (!cancelled) { setSvg(svg); setError(null); }
      } catch (e) {
        if (!cancelled) setError(e?.message ?? String(e));
      }
    })();
    return () => { cancelled = true; };
  }, [chart, config, dark, id]);

  return (
    <figure className="dg-mermaid" style={{ margin: "1.5rem 0" }}>
      {error ? (
        <pre style={{ whiteSpace: "pre-wrap", color: "var(--dg-status-failure-text, #b42318)" }}>Mermaid error: {error}</pre>
      ) : (
        <div style={{ overflowX: "auto" }} dangerouslySetInnerHTML={{ __html: svg }} />
      )}
      {caption ? (
        <figcaption style={{ fontSize: "0.875rem", color: "var(--dg-muted)", marginTop: 8 }}>{caption}</figcaption>
      ) : null}
    </figure>
  );
};

export default Mermaid;
