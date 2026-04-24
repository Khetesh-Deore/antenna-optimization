// AntennaCanvas.jsx — Clean SVG canvas with proper antenna placement

import { useState, useEffect } from "react";
import { dist } from "../utils/antennaUtils";

const W = 600;
const H = 460;

export default function AntennaCanvas({
  mode, positions, radius, freqColors,
  superPositions, superposition, collapsing, finalized,
}) {
  const [rippleR, setRippleR] = useState(0);
  const [rippleOpacity, setRippleOpacity] = useState(0);

  // Ripple on collapse
  useEffect(() => {
    if (collapsing) {
      setRippleR(10);
      setRippleOpacity(0.5);
      const t1 = setTimeout(() => setRippleR(radius * 2.2), 50);
      const t2 = setTimeout(() => setRippleOpacity(0), 1200);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setRippleR(0);
      setRippleOpacity(0);
    }
  }, [collapsing, radius]);

  // Pairs of antennas whose coverage circles overlap
  const overlapPairs = [];
  for (let i = 0; i < positions.length; i++)
    for (let j = i + 1; j < positions.length; j++)
      if (dist(positions[i], positions[j]) < radius * 2)
        overlapPairs.push([i, j]);

  // Entanglement: quantum finalized, same freq band
  const entanglePairs = [];
  if (mode === "quantum" && finalized) {
    for (let i = 0; i < positions.length; i++)
      for (let j = i + 1; j < positions.length; j++)
        if (freqColors[i] === freqColors[j])
          entanglePairs.push([i, j]);
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
      style={{ display: "block" }}
    >
      <defs>
        {positions.map((_, i) => (
          <radialGradient key={`rg-${i}`} id={`rg-${i}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={freqColors[i] ?? "#22c55e"} stopOpacity="0.4" />
            <stop offset="100%" stopColor={freqColors[i] ?? "#22c55e"} stopOpacity="0.0" />
          </radialGradient>
        ))}
        <filter id="softglow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="labelglow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Background hex grid ── */}
      <HexBg />

      {/* ── Canvas border ── */}
      <rect x="1" y="1" width={W - 2} height={H - 2} rx="12"
        fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

      {/* ── Superposition ghost states ── */}
      {mode === "quantum" && superposition &&
        superPositions.map((ghost, gi) => (
          <g key={`ghost-${gi}`}
            opacity={collapsing ? 0.02 : 0.10}
            style={{ transition: "opacity 0.9s ease" }}>
            {ghost.map((p, i) => (
              <circle key={i}
                cx={p.x} cy={p.y} r={radius}
                fill={`${freqColors[i] ?? "#a855f7"}15`}
                stroke={freqColors[i] ?? "#a855f7"}
                strokeWidth="1"
                strokeDasharray="5 5" />
            ))}
          </g>
        ))
      }

      {/* ── Overlap heatmap (midpoint blobs) ── */}
      {overlapPairs.map(([a, b], idx) => {
        const mx = (positions[a].x + positions[b].x) / 2;
        const my = (positions[a].y + positions[b].y) / 2;
        return (
          <circle key={`heat-${idx}`}
            cx={mx} cy={my}
            r={radius * 0.6}
            fill={mode === "classical"
              ? "rgba(239,68,68,0.30)"
              : "rgba(34,197,94,0.12)"}
            style={{ transition: "fill 0.6s ease" }} />
        );
      })}

      {/* ── Coverage fill (radial gradient) ── */}
      {positions.map((p, i) => (
        <circle key={`fill-${i}`}
          cx={p.x} cy={p.y} r={radius}
          fill={`url(#rg-${i})`} />
      ))}

      {/* ── Coverage ring ── */}
      {positions.map((p, i) => (
        <circle key={`ring-${i}`}
          cx={p.x} cy={p.y} r={radius}
          fill="none"
          stroke={freqColors[i] ?? "#22c55e"}
          strokeWidth="1.5"
          strokeDasharray={mode === "quantum" && !finalized ? "7 4" : "none"}
          opacity={mode === "quantum" && !finalized ? 0.85 : 0.7}
          style={{
            filter: mode === "quantum" && !finalized
              ? `drop-shadow(0 0 6px ${freqColors[i] ?? "#a855f7"})`
              : "none",
            transition: "all 0.7s ease",
          }}
          className={mode === "quantum" && !finalized ? "animate-pulse" : ""}
        />
      ))}

      {/* ── Collapse ripple ── */}
      {collapsing && positions.map((p, i) => (
        <circle key={`ripple-${i}`}
          cx={p.x} cy={p.y}
          r={rippleR}
          fill="none"
          stroke="#a855f7"
          strokeWidth="1.5"
          opacity={rippleOpacity}
          style={{ transition: "r 1.3s ease-out, opacity 1.3s ease-out" }} />
      ))}

      {/* ── Entanglement lines ── */}
      {entanglePairs.map(([a, b], idx) => (
        <line key={`ent-${idx}`}
          x1={positions[a].x} y1={positions[a].y}
          x2={positions[b].x} y2={positions[b].y}
          stroke="#a855f7"
          strokeWidth="1.5"
          strokeDasharray="8 4"
          opacity="0.55"
          style={{ filter: "drop-shadow(0 0 4px #a855f7)" }} />
      ))}

      {/* ── Antenna nodes ── */}
      {positions.map((p, i) => (
        <AntennaNode
          key={`ant-${i}`}
          x={p.x} y={p.y}
          color={freqColors[i] ?? "#22c55e"}
          label={`A${i + 1}`}
          freqLabel={`F${i + 1}`}
          mode={mode}
          finalized={finalized}
        />
      ))}

      {/* ── Top-left mode label ── */}
      <ModeLabel mode={mode} collapsing={collapsing} finalized={finalized} />

      {/* ── Top-right overlap badge ── */}
      {overlapPairs.length > 0 && (
        <OverlapBadge count={overlapPairs.length} mode={mode} canvasW={W} />
      )}
    </svg>
  );
}

/* ── Single antenna node with tower icon + labels ── */
function AntennaNode({ x, y, color, label, freqLabel, mode, finalized }) {
  // Tower geometry
  const baseY  = y + 8;   // bottom of mast
  const topY   = y - 20;  // top of mast
  const armY   = y - 14;  // crossbar height
  const armW   = 10;      // half-width of crossbar

  return (
    <g filter="url(#softglow)">
      {/* Outer glow ring */}
      <circle cx={x} cy={y} r={18}
        fill={`${color}18`}
        stroke={color}
        strokeWidth="0.8"
        opacity="0.5" />

      {/* Coverage center dot */}
      <circle cx={x} cy={y} r={8}
        fill={color}
        style={{ filter: `drop-shadow(0 0 5px ${color})` }} />

      {/* Antenna mast */}
      <line x1={x} y1={baseY} x2={x} y2={topY}
        stroke={color} strokeWidth="2" strokeLinecap="round" />

      {/* Crossbar */}
      <line x1={x - armW} y1={armY} x2={x + armW} y2={armY}
        stroke={color} strokeWidth="1.5" strokeLinecap="round" />

      {/* Small signal lines on crossbar */}
      <line x1={x - armW} y1={armY} x2={x - armW + 3} y2={armY - 5}
        stroke={color} strokeWidth="1" opacity="0.7" />
      <line x1={x + armW} y1={armY} x2={x + armW - 3} y2={armY - 5}
        stroke={color} strokeWidth="1" opacity="0.7" />

      {/* Antenna ID label — above the tower */}
      <text
        x={x} y={topY - 8}
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill="white"
        filter="url(#labelglow)"
      >
        {label}
      </text>

      {/* Frequency badge — below the dot */}
      <rect
        x={x - 12} y={y + 12}
        width={24} height={14}
        rx={4}
        fill={`${color}30`}
        stroke={color}
        strokeWidth="0.8"
      />
      <text
        x={x} y={y + 22}
        textAnchor="middle"
        fontSize="9"
        fontWeight="600"
        fill={color}
      >
        {freqLabel}
      </text>
    </g>
  );
}

/* ── Mode label pill ── */
function ModeLabel({ mode, collapsing, finalized }) {
  const text = collapsing
    ? "⚛️  Collapsing Wavefunction..."
    : mode === "classical"
    ? "🔧  Classical — Greedy Heuristic"
    : finalized
    ? "✅  Quantum — Minimum-Energy State"
    : "⚛️  Quantum — Superposition Active";

  return (
    <g>
      <rect x={10} y={10} width={240} height={24} rx={6}
        fill="rgba(2,6,23,0.75)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <text x={20} y={26} fontSize="11" fill="#9ca3af">{text}</text>
    </g>
  );
}

/* ── Overlap count badge ── */
function OverlapBadge({ count, mode, canvasW }) {
  const color = mode === "classical" ? "#f87171" : "#4ade80";
  const label = `${count} overlap${count > 1 ? "s" : ""}`;
  const bw = 100;
  return (
    <g>
      <rect x={canvasW - bw - 10} y={10} width={bw} height={24} rx={6}
        fill="rgba(2,6,23,0.75)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <text x={canvasW - bw / 2 - 10} y={26}
        textAnchor="middle" fontSize="11" fill={color}>
        {label}
      </text>
    </g>
  );
}

/* ── Hex background ── */
function HexBg() {
  const size = 34;
  const pts = (x, y) =>
    [0, 1, 2, 3, 4, 5]
      .map((i) => {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        return `${(x + size * Math.cos(a)).toFixed(1)},${(y + size * Math.sin(a)).toFixed(1)}`;
      })
      .join(" ");

  const rows = 15;
  const cols = 20;
  return (
    <g opacity="0.06">
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const x = c * size * 1.732 + (r % 2) * size * 0.866;
          const y = r * size * 1.5;
          return (
            <polygon key={`${r}-${c}`} points={pts(x, y)}
              fill="none" stroke="#22c55e" strokeWidth="0.8" />
          );
        })
      )}
    </g>
  );
}
