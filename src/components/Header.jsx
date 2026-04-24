export default function Header() {
  return (
    <header className="w-full py-7 text-center border-b border-gray-800/60">
      <div className="flex items-center justify-center gap-3 mb-2">
        <span className="text-3xl">⚛️</span>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
          Antenna Placement Optimizer
        </h1>
      </div>
      <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
        <span className="inline-block px-3 py-1 text-xs bg-green-500/10 text-green-400 rounded-full border border-green-400/20 font-semibold">
          5G Network Simulation
        </span>
        <span className="inline-block px-3 py-1 text-xs bg-purple-500/10 text-purple-400 rounded-full border border-purple-400/20 font-semibold">
          QAOA Quantum-Inspired
        </span>
        <span className="inline-block px-3 py-1 text-xs bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-400/20 font-semibold">
          Real-time Metrics
        </span>
      </div>
      <p className="text-gray-500 mt-3 text-sm">
        Classical Greedy Heuristic vs Quantum Approximate Optimization Algorithm
      </p>
    </header>
  );
}
