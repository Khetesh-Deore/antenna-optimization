// src/components/AntennaCanvas.jsx

import { useEffect, useState } from "react";
import HexGrid from "./HexGrid";

/* ===== FREQUENCY REUSE COLORS ===== */
const FREQUENCIES = [
  { color: "#22c55e", glow: "drop-shadow(0 0 14px #22c55e)" }, // F1
  { color: "#3b82f6", glow: "drop-shadow(0 0 14px #3b82f6)" }, // F2
  { color: "#a855f7", glow: "drop-shadow(0 0 14px #a855f7)" }, // F3
  { color: "#f97316", glow: "drop-shadow(0 0 14px #f97316)" }, // F4
  { color: "#ef4444", glow: "drop-shadow(0 0 14px #ef4444)" }, // F5
];

export default function AntennaCanvas({
  mode,
  superposition,
  superDistances = [],
  finalized,
}) {
  const CENTER_X = 280;
  const CENTER_Y = 220;
  const RADIUS = 95;

  /* ===== COLLAPSE TRANSITION STATE ===== */
  const [collapsing, setCollapsing] = useState(false);

  /* ===== BASE ANTENNA LAYOUT ===== */
  const baseAntennas = [
    { x: CENTER_X - 90, y: CENTER_Y - 40 },
    { x: CENTER_X + 80, y: CENTER_Y - 20 },
    { x: CENTER_X - 20, y: CENTER_Y + 80 },
    { x: CENTER_X - 100, y: CENTER_Y + 60 },
    { x: CENTER_X + 110, y: CENTER_Y + 60 },
  ];

  /* ===== TRIGGER COLLAPSE WHEN MEASURED ===== */
  useEffect(() => {
    if (mode === "quantum" && finalized) {
      setCollapsing(true);
      const t = setTimeout(() => setCollapsing(false), 800);
      return () => clearTimeout(t);
    }
  }, [mode, finalized]);

  /* ===== SMOOTH POSITION INTERPOLATION ===== */
  const baseSpread = mode === "quantum" && finalized ? 22 : 0;
  const animatedSpread = collapsing ? baseSpread * 0.3 : baseSpread;

  const antennas = baseAntennas.map((a, i) => ({
    ...a,
    x: a.x + animatedSpread * Math.sign(a.x - CENTER_X),
    y: a.y + animatedSpread * Math.sign(a.y - CENTER_Y),
    freq: FREQUENCIES[i % FREQUENCIES.length],
    id: i + 1,
  }));

  return (
    <svg viewBox="0 0 560 440" className="w-full h-full rounded-xl">
      {/* HEX GRID BACKGROUND */}
      <HexGrid />

      {/* ================= SUPERPOSITION STATES ================= */}
      {mode === "quantum" &&
        superposition &&
        superDistances.map((d, idx) => (
          <g
            key={idx}
            opacity={collapsing ? 0.05 : 0.18}
            style={{ transition: "opacity 0.6s ease" }}
          >
            {antennas.map((a, i) => (
              <circle
                key={i}
                cx={a.x + (idx % 2 ? d / 4 : -d / 4)}
                cy={a.y + (idx % 2 ? -d / 6 : d / 6)}
                r={RADIUS}
                fill={`${a.freq.color}33`}
              />
            ))}
          </g>
        ))}

      {/* ================= INTERFERENCE HEATMAP ================= */}
      {antennas.map((a, i) => (
        <circle
          key={`heat-${i}`}
          cx={a.x}
          cy={a.y}
          r={RADIUS * 0.75}
          fill={
            mode === "classical"
              ? "rgba(239,68,68,0.25)"   // 🔴 high interference
              : finalized
              ? "rgba(34,197,94,0.18)"  // 🟢 optimized
              : "rgba(168,85,247,0.2)"  // 🟣 quantum uncertainty
          }
          style={{ transition: "all 0.6s ease" }}
        />
      ))}

      {/* ================= COVERAGE CIRCLES ================= */}
      {antennas.map((a, i) => (
        <circle
          key={`cov-${i}`}
          cx={a.x}
          cy={a.y}
          r={RADIUS}
          fill={`${a.freq.color}33`}
          stroke={a.freq.color}
          strokeWidth="2"
          style={{
            filter:
              mode === "quantum" && !finalized
                ? a.freq.glow
                : "none",
            transition: "all 0.6s ease",
          }}
          className={
            mode === "quantum" && !finalized
              ? "animate-pulse"
              : ""
          }
        />
      ))}

      {/* ================= ANTENNA ICONS ================= */}
      {antennas.map((a, i) => (
        <g key={`ant-${i}`}>
          <circle cx={a.x} cy={a.y} r="8" fill={a.freq.color} />
          <text
            x={a.x}
            y={a.y - 14}
            textAnchor="middle"
            fontSize="11"
            fill="white"
          >
            {a.id}
          </text>
        </g>
      ))}

      {/* ================= MODE LABEL ================= */}
      <text x="18" y="28" fontSize="14" fill="#9ca3af">
        {collapsing
          ? "⚛️ Collapsing Wavefunction..."
          : mode === "classical"
          ? "Classical: High Interference Layout"
          : finalized
          ? "Quantum: Minimum-Energy Configuration"
          : "Quantum: Superposition of Multiple States"}
      </text>
    </svg>
  );
}
