// ControlPanel.jsx — User input sliders for simulation parameters

export default function ControlPanel({ params, onChange, locked }) {
  const { antennas, spacing, radius } = params;

  const slider = (label, key, min, max, unit, color) => (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className={`font-semibold ${color}`}>
          {params[key]}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={params[key]}
        disabled={locked}
        onChange={(e) => onChange(key, Number(e.target.value))}
        className={`w-full accent-green-400 ${locked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
      />
      <div className="flex justify-between text-xs text-gray-600">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-5">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
        Simulation Parameters
      </h3>
      {slider("Number of Antennas", "antennas", 2, 10, "", "text-amber-400")}
      {slider("Antenna Spacing", "spacing", 50, 300, "px", "text-cyan-400")}
      {slider("Coverage Radius", "radius", 50, 200, "px", "text-green-400")}
      {locked && (
        <p className="text-xs text-purple-400 text-center animate-pulse">
          🔒 Locked during quantum superposition
        </p>
      )}
    </div>
  );
}
