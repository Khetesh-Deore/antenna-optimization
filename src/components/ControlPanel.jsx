// ControlPanel.jsx — User input controls

export default function ControlPanel({ params, onChange, locked }) {
  const sliders = [
    { label: "Antennas", key: "antennas", min: 2, max: 10, unit: "", color: "text-amber-400", accent: "#f59e0b" },
    { label: "Spacing",  key: "spacing",  min: 50, max: 300, unit: "px", color: "text-cyan-400", accent: "#06b6d4" },
    { label: "Radius",   key: "radius",   min: 50, max: 200, unit: "px", color: "text-green-400", accent: "#22c55e" },
  ];

  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-5">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
        ⚙️ Simulation Parameters
      </h3>

      {sliders.map(({ label, key, min, max, unit, color, accent }) => {
        const pct = ((params[key] - min) / (max - min)) * 100;
        return (
          <div key={key} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">{label}</span>
              <span className={`font-bold tabular-nums ${color}`}>
                {params[key]}{unit}
              </span>
            </div>
            <div className="relative">
              <input
                type="range" min={min} max={max} value={params[key]}
                disabled={locked}
                onChange={(e) => onChange(key, Number(e.target.value))}
                className={`w-full h-2 rounded-full appearance-none bg-slate-800 outline-none
                  ${locked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                style={{ accentColor: accent }}
              />
              {/* progress fill */}
              <div className="pointer-events-none absolute top-0 left-0 h-2 rounded-full"
                style={{ width: `${pct}%`, background: accent, opacity: 0.5 }} />
            </div>
            <div className="flex justify-between text-xs text-gray-700">
              <span>{min}{unit}</span>
              <span>{max}{unit}</span>
            </div>
          </div>
        );
      })}

      {locked && (
        <div className="flex items-center gap-2 text-xs text-purple-400 bg-purple-500/10 rounded-lg px-3 py-2 border border-purple-500/20">
          <span className="animate-pulse">🔒</span>
          <span>Locked during quantum superposition</span>
        </div>
      )}
    </div>
  );
}
