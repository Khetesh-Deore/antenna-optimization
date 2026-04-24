export default function Header() {
  return (
    <header className="w-full py-6 text-center border-b border-gray-700">
      <h1 className="text-3xl md:text-4xl font-bold text-green-400">
        Antenna Placement Optimization ⚛️
      </h1>

      {/* 5G / Research Lab badge */}
      <span className="inline-block mt-3 px-4 py-1 text-sm bg-green-500/10 text-green-400 rounded-full border border-green-400/20">
        5G / Quantum Network Simulation
      </span>

      <p className="text-gray-400 mt-3">
        Classical vs Quantum-Inspired Approaches
      </p>
    </header>
  );
}
