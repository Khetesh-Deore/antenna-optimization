// ComparisonTable.jsx — Full comparison with radar-style visual

export default function ComparisonTable({ classical, quantum, onExport }) {
  if (!classical || !quantum) return null;

  const rows = [
    { label: "Interference Score", icon: "📡", cVal: classical.interference, qVal: quantum.interference, lowerIsBetter: true,  suffix: ""  },
    { label: "Network Coverage",   icon: "🌐", cVal: classical.coverage,     qVal: quantum.coverage,     lowerIsBetter: false, suffix: "%" },
    { label: "Network Efficiency", icon: "⚡", cVal: classical.efficiency,   qVal: quantum.efficiency,   lowerIsBetter: false, suffix: "%" },
    { label: "Active Antennas",    icon: "🔭", cVal: classical.antennas,     qVal: quantum.antennas,     lowerIsBetter: false, suffix: ""  },
  ];

  const winner = (cVal, qVal, lib) => (lib ? qVal < cVal : qVal > cVal) ? "quantum" : "classical";

  const impPct = (cVal, qVal, lib) => {
    if (!cVal) return "—";
    const delta = lib ? cVal - qVal : qVal - cVal;
    const pct = ((delta / Math.abs(cVal)) * 100).toFixed(1);
    return `${delta >= 0 ? "+" : ""}${pct}%`;
  };

  const quantumWins = rows.filter((r) => winner(r.cVal, r.qVal, r.lowerIsBetter) === "quantum").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Score banner */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <ScorePill label="Classical Wins" value={rows.length - quantumWins} color="text-green-400 border-green-500/30 bg-green-500/10" />
        <ScorePill label="Overall Winner" value={quantumWins >= rows.length / 2 ? "⚛️ Quantum" : "🔧 Classical"}
          color={quantumWins >= rows.length / 2 ? "text-purple-400 border-purple-500/30 bg-purple-500/10" : "text-green-400 border-green-500/30 bg-green-500/10"} />
        <ScorePill label="Quantum Wins" value={quantumWins} color="text-purple-400 border-purple-500/30 bg-purple-500/10" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-900/80 text-gray-400 text-xs uppercase tracking-wider">
              <th className="text-left py-3 px-4">Metric</th>
              <th className="text-center py-3 px-3">🔧 Classical</th>
              <th className="text-center py-3 px-3">⚛️ Quantum</th>
              <th className="text-center py-3 px-3">Δ Improvement</th>
              <th className="text-center py-3 px-3">Winner</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const w = winner(r.cVal, r.qVal, r.lowerIsBetter);
              return (
                <tr key={r.label}
                  className={`border-t border-slate-800/60 ${idx % 2 === 0 ? "bg-slate-900/30" : ""}`}>
                  <td className="py-3 px-4 text-gray-300 flex items-center gap-2">
                    <span>{r.icon}</span>{r.label}
                  </td>
                  <td className={`text-center py-3 px-3 font-bold tabular-nums ${w === "classical" ? "text-green-400" : "text-gray-500"}`}>
                    {r.cVal}{r.suffix}
                  </td>
                  <td className={`text-center py-3 px-3 font-bold tabular-nums ${w === "quantum" ? "text-purple-400" : "text-gray-500"}`}>
                    {r.qVal}{r.suffix}
                  </td>
                  <td className="text-center py-3 px-3">
                    <span className={`font-semibold ${
                      parseFloat(impPct(r.cVal, r.qVal, r.lowerIsBetter)) >= 0 ? "text-green-400" : "text-red-400"
                    }`}>
                      {impPct(r.cVal, r.qVal, r.lowerIsBetter)}
                    </span>
                  </td>
                  <td className="text-center py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      w === "quantum" ? "bg-purple-500/20 text-purple-400" : "bg-green-500/20 text-green-400"
                    }`}>
                      {w === "quantum" ? "⚛️ Quantum" : "🔧 Classical"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bar chart */}
      <BarChart classical={classical} quantum={quantum} />

      {/* Export */}
      <div className="text-right">
        <button onClick={onExport}
          className="px-5 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition">
          📋 Export Summary
        </button>
      </div>
    </div>
  );
}

function ScorePill({ label, value, color }) {
  return (
    <div className={`rounded-xl border px-3 py-3 ${color}`}>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

function BarChart({ classical, quantum }) {
  const metrics = [
    { label: "Interference", cVal: classical.interference, qVal: quantum.interference, lowerIsBetter: true },
    { label: "Coverage %",   cVal: classical.coverage,     qVal: quantum.coverage,     lowerIsBetter: false },
    { label: "Efficiency %", cVal: classical.efficiency,   qVal: quantum.efficiency,   lowerIsBetter: false },
  ];

  return (
    <div>
      <p className="text-xs text-gray-500 mb-3 uppercase tracking-widest">Visual Comparison</p>
      <div className="flex flex-col gap-5">
        {metrics.map((m) => {
          const max = Math.max(m.cVal, m.qVal, 1);
          const qBetter = m.lowerIsBetter ? m.qVal < m.cVal : m.qVal > m.cVal;
          return (
            <div key={m.label}>
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span className="font-medium">{m.label}</span>
                <span>
                  <span className="text-green-400 font-semibold">{m.cVal}</span>
                  <span className="text-gray-600 mx-1">vs</span>
                  <span className="text-purple-400 font-semibold">{m.qVal}</span>
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: "Classical", val: m.cVal, color: "bg-green-500" },
                  { label: "Quantum",   val: m.qVal, color: qBetter ? "bg-purple-400" : "bg-purple-700" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16 shrink-0">{label}</span>
                    <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all duration-700`}
                        style={{ width: `${(val / 100) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right tabular-nums">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
