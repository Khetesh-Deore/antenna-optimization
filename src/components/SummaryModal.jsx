// SummaryModal.jsx — Export result summary modal

export default function SummaryModal({ classical, quantum, params, onClose }) {
  if (!classical || !quantum) return null;

  const rows = [
    { label: "Interference Score", cVal: classical.interference, qVal: quantum.interference, suffix: "", lowerIsBetter: true },
    { label: "Network Coverage", cVal: classical.coverage, qVal: quantum.coverage, suffix: "%", lowerIsBetter: false },
    { label: "Network Efficiency", cVal: classical.efficiency, qVal: quantum.efficiency, suffix: "%", lowerIsBetter: false },
    { label: "Active Antennas", cVal: classical.antennas, qVal: quantum.antennas, suffix: "", lowerIsBetter: false },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-1">
          📋 Optimization Result Summary
        </h3>
        <p className="text-xs text-gray-500 mb-5">
          Antennas: {params.antennas} · Spacing: {params.spacing}px · Radius: {params.radius}px
        </p>

        <div className="space-y-3 text-sm">
          {/* Classical block */}
          <div className="bg-slate-800/60 rounded-xl p-4">
            <h4 className="font-semibold text-green-400 mb-2">🔧 Classical Optimization</h4>
            {rows.map((r) => (
              <div key={r.label} className="flex justify-between text-gray-300 py-0.5">
                <span>{r.label}</span>
                <span className="font-semibold">{r.cVal}{r.suffix}</span>
              </div>
            ))}
          </div>

          {/* Quantum block */}
          <div className="bg-slate-800/60 rounded-xl p-4">
            <h4 className="font-semibold text-purple-400 mb-2">⚛️ Quantum Optimization</h4>
            {rows.map((r) => (
              <div key={r.label} className="flex justify-between text-gray-300 py-0.5">
                <span>{r.label}</span>
                <span className="font-semibold">{r.qVal}{r.suffix}</span>
              </div>
            ))}
          </div>

          {/* Delta summary */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <h4 className="font-semibold text-green-400 mb-2">📈 Quantum Advantage</h4>
            {rows.map((r) => {
              const delta = r.lowerIsBetter ? r.cVal - r.qVal : r.qVal - r.cVal;
              const pct = r.cVal !== 0 ? ((Math.abs(delta) / Math.abs(r.cVal)) * 100).toFixed(1) : "0.0";
              return (
                <div key={r.label} className="flex justify-between text-gray-300 py-0.5">
                  <span>{r.label}</span>
                  <span className={`font-semibold ${delta >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {delta >= 0 ? "+" : ""}{delta.toFixed(1)}{r.suffix} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
