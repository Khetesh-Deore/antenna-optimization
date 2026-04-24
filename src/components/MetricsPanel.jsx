// MetricsPanel.jsx — 4-metric dashboard cards

export default function MetricsPanel({ metrics, mode }) {
  const cards = [
    {
      title: "Interference Score",
      value: metrics.interference,
      suffix: "",
      color: "text-red-400",
      bar: "bg-red-500",
      pct: Math.min(metrics.interference, 100),
      icon: "📡",
    },
    {
      title: "Network Coverage",
      value: metrics.coverage,
      suffix: "%",
      color: "text-cyan-400",
      bar: "bg-cyan-500",
      pct: metrics.coverage,
      icon: "🌐",
    },
    {
      title: "Network Efficiency",
      value: metrics.efficiency,
      suffix: "%",
      color: "text-green-400",
      bar: "bg-green-500",
      pct: metrics.efficiency,
      icon: "⚡",
    },
    {
      title: "Active Antennas",
      value: metrics.antennas,
      suffix: "",
      color: "text-amber-400",
      bar: "bg-amber-500",
      pct: (metrics.antennas / 10) * 100,
      icon: "🔭",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div
          key={c.title}
          className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>{c.icon}</span>
            <span>{c.title}</span>
          </div>
          <div className={`text-2xl font-bold ${c.color}`}>
            {c.value}
            {c.suffix}
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${c.bar} rounded-full transition-all duration-700`}
              style={{ width: `${c.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
