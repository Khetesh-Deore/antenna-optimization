// ComparisonTable.jsx — Side-by-side Classical vs Quantum comparison

export default function ComparisonTable({ classical, quantum, onExport }) {
  if (!classical || !quantum) return null;

  const rows = [
    {
      label: "Interference Score",
      cVal: classical.interference,
      qVal: quantum.interference,
      lowerIsBetter: true,
      suffix: "",
    },
    {
      label: "Network Coverage",
      cVal: classical.coverage,
      qVal: quantum.coverage,
      lowerIsBetter: false,
      suffix: "%",
    },
    {
      label: "Network Efficiency",
      cVal: classical.efficiency,
      qVal: quantum.efficiency,
      lowerIsBetter: false,
      suffix: "%",
    },
    {
      label: "Active Antennas",
      cVal: classical.antennas,
      qVal: quantum.antennas,
      lowerIsBetter: false,
      suffix: "",
    },
  ];

  const winner = (cVal, qVal, lowerIsBetter) => {
    if (lowerIsBetter) return qVal < cVal ? "quantum" : "classical";
    return qVal > cVal ? "quantum" : "classical";
  };

  const improvement = (cVal, qVal, lowerIsBetter) => {
    if (cVal === 0) return "0%";
    const delta = lowerIsBetter ? cVal - qVal : qVal - cVal;
    const pct = ((delta / Math.abs(cVal)) * 100).toFixed(1);
    return `${delta >= 0 ? "+" : ""}${pct}%`;
  };

  return (
    <div className="glass rounded-2xl p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          📊 Classical vs Quantum Comparison
        </h3>
        <button
          onClick={onExport}
          className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition"
        >
          Export Summary
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-slate-800">
              <th className="text-left py-2 pr-4">Metric</th>
              <th className="text-center py-2 px-3">Classical</th>
              <th className="text-center py-2 px-3">Quantum</th>
              <th className="text-center py-2 px-3">Improvement</th>
              <th className="text-center py-2 pl-3">Winner</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const w = winner(r.cVal, r.qVal, r.lowerIsBetter);
              const imp = improvement(r.cVal, r.qVal, r.lowerIsBetter);
              return (
                <tr key={r.label} className="border-b border-slate-800/50">
                  <td className="py-3 pr-4 text-gray-300">{r.label}</td>
                  <td
                    className={`text-center py-3 px-3 font-semibold ${
                      w === "classical" ? "text-green-400" : "text-gray-400"
                    }`}
                  >
                    {r.cVal}{r.suffix}
                  </td>
                  <td
                    className={`text-center py-3 px-3 font-semibold ${
                      w === "quantum" ? "text-purple-400" : "text-gray-400"
                    }`}
                  >
                    {r.qVal}{r.suffix}
                  </td>
                  <td className="text-center py-3 px-3 text-green-400 font-semibold">
                    {imp}
                  </td>
                  <td className="text-center py-3 pl-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        w === "quantum"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
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
    </div>
  );
}

function BarChart({ classical, quantum }) {
  const metrics = [
    { label: "Interference", cVal: classical.interference, qVal: quantum.interference, max: 100 },
    { label: "Coverage", cVal: classical.coverage, qVal: quantum.coverage, max: 100 },
    { label: "Efficiency", cVal: classical.efficiency, qVal: quantum.efficiency, max: 100 },
  ];

  return (
    <div className="mt-6">
      <p className="text-xs text-gray-500 mb-3 uppercase tracking-widest">Visual Comparison</p>
      <div className="flex flex-col gap-4">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{m.label}</span>
              <span>
                <span className="text-green-400">{m.cVal}</span>
                {" vs "}
                <span className="text-purple-400">{m.qVal}</span>
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16">Classical</span>
                <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-700"
                    style={{ width: `${(m.cVal / m.max) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16">Quantum</span>
                <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-700"
                    style={{ width: `${(m.qVal / m.max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
