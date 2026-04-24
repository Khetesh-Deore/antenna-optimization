// AntennaCanvas.jsx — SVG visualization of antenna layout

import { useEffect, useRef } from "react";
import { dist } from "../utils/antennaUtils";

const CANVAS_W = 560;
const CANVAS_H = 420;

export default function AntennaCanvas({
  mode,
  positions,
  radius,
  freqColors,
  superPositions,   // array of ghost position arrays for superposition
  superposition,    // bool: show ghost states
  collapsing,       // bool: collapse animation active
  finalized,        // bool: quantum measurement done
}) {
  // Determine heatmap color per antenna based on mode
  const heatColor = (i) => {
    if (mode === "classical") return "rgba(239,68,68,0.22)";
    if (finalized) return "rgba(34,197,94,0.18)";
    return "rgba(168,85,247,0.2)";
  };

  // Entanglement lines between antennas sharing same frequency (quantum finalized)
  const entanglementPairs = [];
  if (mode === "quantum" && finalized) {
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        if (freqColors[i] === freqColors[j]) {
          entanglementPairs.push([i, j]);
        }
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      className="w-full h-full rounded-xl"
    >
      {/* ── Hex grid background ── */}
      <HexBg />

      {/* ── Superposition ghost states ── */}
      {mode === "quantum" && superposition && superPositions.map((ghost, gi) => (
        <g
          key={`ghost-${gi}`}
          opacity={collapsing ? 0.03 : 0.13}
          style={{ transition: "opacity 0.7s ease" }}
        >
          {ghost.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={radius}
              fill={`${freqColors[i] ?? "#a855f7"}22`}
              stroke={freqColors[i] ?? "#a855f7"}
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}
        </g>
      ))}

      {/* ── Interference heatmap ── */}
      {positions.map((p, i) => (
        <circle
          key={`heat-${i}`}
          cx={p.x}
          cy={p.y}
          r={radius * 0.72}
          fill={heatColor(i)}
          style={{ transition: "fill 0.6s ease" }}
        />
      ))}

      {/* ── Coverage circles ── */}
      {positions.map((p, i) => (
        <circle
          key={`cov-${i}`}
          cx={p.x}
          cy={p.y}
          r={radius}
          fill={`${freqColors[i] ?? "#22c55e"}28`}
          stroke={freqColors[i] ?? "#22c55e"}
          strokeWidth={mode === "quantum" && !finalized ? 1.5 : 1.5}
          style={{
            filter: mode === "quantum" && !finalized
              ? `drop-shadow(0 0 10px ${freqColors[i] ?? "#a855f7"})`
              : "none",
            transition: "all 0.6s ease",
          }}
          className={mode === "quantum" && !finalized ? "animate-pulse" : ""}
        />
      ))}

      {/* ── Entanglement lines (quantum finalized) ── */}
      {entanglementPairs.map(([a, b], idx) => (
        <line
          key={`ent-${idx}`}
          x1={positions[a].x}
          y1={positions[a].y}
          x2={positions[b].x}
          y2={positions[b].y}
          stroke="#a855f7"
          strokeWidth="1.5"
          strokeDasharray="6 3"
          opacity="0.55"
          style={{ filter: "drop-shadow(0 0 4px #a855f7)" }}
        />
      ))}

      {/* ── Antenna dots + labels ── */}
      {positions.map((p, i) => (
        <g key={`ant-${i}`}>
          {/* outer glow ring */}
          <circle
            cx={p.x}
            cy={p.y}
            r="13"
            fill={`${freqColors[i] ?? "#22c55e"}33`}
            style={{ filter: `drop-shadow(0 0 8px ${freqColors[i] ?? "#22c55e"})` }}
          />
          {/* core dot */}
          <circle cx={p.x} cy={p.y} r="7" fill={freqColors[i] ?? "#22c55e"} />
          {/* antenna ID */}
          <text
            x={p.x}
            y={p.y - 18}
            textAnchor="middle"
            fontSize="11"
            fill="white"
            fontWeight="600"
          >
            A{i + 1}
          </text>
          {/* frequency label */}
          <text
            x={p.x}
            y={p.y + 26}
            textAnchor="middle"
            fontSize="9"
            fill={freqColors[i] ?? "#22c55e"}
            opacity="0.8"
          >
            F{i + 1}
          </text>
        </g>
      ))}

      {/* ── Mode label ── */}
      <text x="12" y="22" fontSize="12" fill="#6b7280">
        {collapsing
          ? "⚛️ Collapsing Wavefunction..."
          : mode === "classical"
          ? "Classical: Greedy Heuristic Layout"
          : finalized
          ? "Quantum: Minimum-Energy Configuration"
          : "Quantum: Superposition of Candidate States"}
      </text>
    </svg>
  );
}

// Inline mini hex grid for the SVG canvas background
function HexBg() {
  const size = 38;
  const rows = 12;
  const cols = 16;
  const pts = (x, y) =>
    [0,1,2,3,4,5].map(i => {
      const a = (Math.PI/3)*i - Math.PI/6;
      return `${x+size*Math.cos(a)},${y+size*Math.sin(a)}`;
    }).join(" ");
  return (
    <g opacity="0.06">
      {[...Array(rows)].map((_, r) =>
        [...Array(cols)].map((_, c) => {
          const x = c * size * 1.732 + (r%2)*size*0.866;
          const y = r * size * 1.5;
          return <polygon key={`${r}-${c}`} points={pts(x,y)} fill="none" stroke="#22c55e" strokeWidth="1"/>;
        })
      )}
    </g>
  );
}
