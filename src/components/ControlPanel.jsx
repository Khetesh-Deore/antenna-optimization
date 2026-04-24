// ControlPanel.jsx — Clean slider controls

export default function ControlPanel({ params, onChange, locked }) {
  const sliders = [
    {
      label: "Antennas",
      key: "antennas",
      min: 2, max: 10, unit: "",
      color: "text-amber-400",
      trackColor: "#f59e0b",
    },
    {
      label: "Spacing",
      key: "spacing",
      min: 50, max: 300, unit: "px",
      color: "text-cyan-400",
      trackColor: "#06b6d4",
    },
    {
      label: "Radius",
      key: "radius",
      min: 50, max: 200, unit: "px",
      color: "text-green-400",
      trackColor: "#22c55e",
    },
  ];

  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-6">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
        <span>⚙️</span> Simulation Parameters
      </h3>

      {sliders.map(({ label, key, min, max, unit, color, trackColor }) => {
        const val = params[key];
        const pct = ((val - min) / (max - min)) * 100;

        return (
          <div key={key} className="flex flex-col gap-2">
            {/* Label + value */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-200 font-medium">{label}</span>
              <span className={`text-sm font-bold tabular-nums ${color}`}>
                {val}{unit}
              </span>
            </div>

            {/* Slider — single element, no overlay divs */}
            <input
              type="range"
              min={min}
              max={max}
              value={val}
              disabled={locked}
              onChange={(e) => onChange(key, Number(e.target.value))}
              className={`slider-track ${locked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              style={{
                "--pct": `${pct}%`,
                "--track-color": trackColor,
              }}
            />

            {/* Min / max labels */}
            <div className="flex justify-between text-xs text-gray-600">
              <span>{min}{unit}</span>
              <span>{max}{unit}</span>
            </div>
          </div>
        );
      })}

      {locked && (
        <div className="flex items-center gap-2 text-xs text-purple-400
                        bg-purple-500/10 rounded-lg px-3 py-2 border border-purple-500/20">
          <span className="animate-pulse">🔒</span>
          <span>Locked during quantum superposition</span>
        </div>
      )}
    </div>
  );
}
