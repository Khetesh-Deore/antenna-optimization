// MetricsPanel.jsx — Animated metric cards with trend indicators

export default function MetricsPanel({ metrics, mode, prevMetrics }) {
  const cards = [
    {
      title: "Interference Score",
      value: metrics.interference,
      suffix: "",
      color: "text-red-400",
      bar: "bg-gradient-to-r from-red-600 to-red-400",
      pct: Math.min(metrics.interference, 100),
      icon: "📡",
      desc: "Lower is better",
      prev: prevMetrics?.interference,
      lowerIsBetter: true,
    },
    {
      title: "Network Coverage",
      value: metrics.coverage,
      suffix: "%",
      color: "text-cyan-400",
      bar: "bg-gradient-to-r from-cyan-600 to-cyan-400",
      pct: metrics.coverage,
      icon: "🌐",
      desc: "Area covered",
      prev: prevMetrics?.coverage,
      lowerIsBetter: false,
    },
    {
      title: "Network Efficiency",
      value: metrics.efficiency,
      suffix: "%",
      color: "text-green-400",
      bar: "bg-gradient-to-r from-green-600 to-green-400",
      pct: metrics.efficiency,
      icon: "⚡",
      desc: "Coverage per antenna",
      prev: prevMetrics?.efficiency,
      lowerIsBetter: false,
    },
    {
      title: "Active Antennas",
      value: metrics.antennas,
      suffix: "",
      color: "text-amber-400",
      bar: "bg-gradient-to-r from-amber-600 to-amber-400",
      pct: (metrics.antennas / 10) * 100,
      icon: "🔭",
      desc: "Nodes in network",
      prev: prevMetrics?.antennas,
      lowerIsBetter: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c) => {
        const improved =
          c.prev !== undefined && c.prev !== null
            ? c.lowerIsBetter
              ? c.value < c.prev
              : c.value > c.prev
            : null;

        return (
          <div key={c.title}
            className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 flex flex-col gap-2 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>{c.icon}</span>
                <span>{c.title}</span>
              </div>
              {improved !== null && (
                <span className={`text-xs font-bold ${improved ? "text-green-400" : "text-red-400"}`}>
                  {improved ? "▲" : "▼"}
                </span>
              )}
            </div>
            <div className={`text-2xl font-bold tabular-nums ${c.color}`}>
              {c.value}{c.suffix}
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full ${c.bar} rounded-full transition-all duration-700`}
                style={{ width: `${c.pct}%` }} />
            </div>
            <div className="text-xs text-gray-600">{c.desc}</div>
          </div>
        );
      })}
    </div>
  );
}
