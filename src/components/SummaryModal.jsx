// SummaryModal.jsx — Export summary with copy-to-clipboard

import { useState } from "react";

export default function SummaryModal({ classical, quantum, params, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!classical || !quantum) return null;

  const rows = [
    { label: "Interference Score", cVal: classical.interference, qVal: quantum.interference, suffix: "", lowerIsBetter: true },
    { label: "Network Coverage",   cVal: classical.coverage,     qVal: quantum.coverage,     suffix: "%", lowerIsBetter: false },
    { label: "Network Efficiency", cVal: classical.efficiency,   qVal: quantum.efficiency,   suffix: "%", lowerIsBetter: false },
    { label: "Active Antennas",    cVal: classical.antennas,     qVal: quantum.antennas,     suffix: "", lowerIsBetter: false },
  ];

  const handleCopy = () => {
    const text = [
      "=== Antenna Optimization Summary ===",
      `Config: ${params.antennas} antennas | Spacing: ${params.spacing}px | Radius: ${params.radius}px`,
      "",
      "CLASSICAL:",
      ...rows.map((r) => `  ${r.label}: ${r.cVal}${r.suffix}`),
      "",
      "QUANTUM:",
      ...rows.map((r) => `  ${r.label}: ${r.qVal}${r.suffix}`),
      "",
      "QUANTUM ADVANTAGE:",
      ...rows.map((r) => {
        const delta = r.lowerIsBetter ? r.cVal - r.qVal : r.qVal - r.cVal;
        const pct = r.cVal ? ((Math.abs(delta) / Math.abs(r.cVal)) * 100).toFixed(1) : "0.0";
        return `  ${r.label}: ${delta >= 0 ? "+" : ""}${delta.toFixed(1)}${r.suffix} (${pct}%)`;
      }),
    ].join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xl font-bold text-white">📋 Optimization Summary</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>

        {/* Config badge */}
        <div className="flex gap-2 flex-wrap mb-5 mt-2">
          {[
            { label: "Antennas", val: params.antennas, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
            { label: "Spacing",  val: `${params.spacing}px`, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
            { label: "Radius",   val: `${params.radius}px`, color: "text-green-400 bg-green-500/10 border-green-500/20" },
          ].map(({ label, val, color }) => (
            <span key={label} className={`text-xs px-3 py-1 rounded-full border font-semibold ${color}`}>
              {label}: {val}
            </span>
          ))}
        </div>

        <div className="space-y-3 text-sm">
          {/* Classical */}
          <div className="bg-slate-800/60 rounded-xl p-4">
            <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
              🔧 Classical Optimization
            </h4>
            {rows.map((r) => (
              <div key={r.label} className="flex justify-between text-gray-300 py-0.5">
                <span className="text-gray-400">{r.label}</span>
                <span className="font-semibold tabular-nums">{r.cVal}{r.suffix}</span>
              </div>
            ))}
          </div>

          {/* Quantum */}
          <div className="bg-slate-800/60 rounded-xl p-4">
            <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              ⚛️ Quantum Optimization
            </h4>
            {rows.map((r) => (
              <div key={r.label} className="flex justify-between text-gray-300 py-0.5">
                <span className="text-gray-400">{r.label}</span>
                <span className="font-semibold tabular-nums">{r.qVal}{r.suffix}</span>
              </div>
            ))}
          </div>

          {/* Delta */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <h4 className="font-semibold text-green-400 mb-2">📈 Quantum Advantage</h4>
            {rows.map((r) => {
              const delta = r.lowerIsBetter ? r.cVal - r.qVal : r.qVal - r.cVal;
              const pct = r.cVal ? ((Math.abs(delta) / Math.abs(r.cVal)) * 100).toFixed(1) : "0.0";
              return (
                <div key={r.label} className="flex justify-between text-gray-300 py-0.5">
                  <span className="text-gray-400">{r.label}</span>
                  <span className={`font-semibold tabular-nums ${delta >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {delta >= 0 ? "+" : ""}{delta.toFixed(1)}{r.suffix}
                    <span className="text-gray-500 ml-1 text-xs">({pct}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex justify-between items-center">
          <button onClick={handleCopy}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition flex items-center gap-2">
            {copied ? "✅ Copied!" : "📋 Copy to Clipboard"}
          </button>
          <button onClick={onClose}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-semibold transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
