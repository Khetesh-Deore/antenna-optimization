import { useState, useEffect } from "react";
import AntennaCanvas from "./AntennaCanvas";

/* ================= CORE MATH ================= */

function calculateOverlap(r, d) {
  if (d >= 2 * r) return 0;
  const part1 = 2 * r * r * Math.acos(d / (2 * r));
  const part2 = 0.5 * d * Math.sqrt(4 * r * r - d * d);
  return Math.max(part1 - part2, 0);
}

/* ================= FINAL TUNED METRICS ================= */
function calculateMetrics(rawOverlap, mode, antennas = 5) {
  let interferenceScore = Math.min(rawOverlap / 120, 120);

  if (mode === "classical") {
    interferenceScore += 10;
  }

  if (mode === "quantum") {
    interferenceScore = Math.max(interferenceScore - 25, 20);
  }

  const coverage = Math.max(
    45,
    Math.min(90, 100 - interferenceScore * 0.6)
  );

  const efficiency = Math.max(
    10,
    Math.min(
      100,
      100 - interferenceScore * 0.9 + coverage * 0.4 - antennas * 2
    )
  );

  return {
    overlap: Number(interferenceScore.toFixed(1)),
    coverage: Number(coverage.toFixed(1)),
    efficiency: Number(efficiency.toFixed(1)),
    antennas,
  };
}

/* ================= COMPONENT ================= */

export default function SimulationBox({ mode }) {
  const [distance, setDistance] = useState(180);
  const [measured, setMeasured] = useState(false);
  const [finalized, setFinalized] = useState(false);

  const [metrics, setMetrics] = useState({
    overlap: 0,
    coverage: 0,
    efficiency: 0,
  });

  const [classicalScore, setClassicalScore] = useState(null);

  /* ✅ EXPORT SUMMARY STATE */
  const [showSummary, setShowSummary] = useState(false);

  const radius = 130;
  const overlap = calculateOverlap(radius, distance);

  const superpositionDistances = [140, 170, 200, 230];

  useEffect(() => {
    setMeasured(false);
    setFinalized(false);
  }, [mode]);

  useEffect(() => {
    if (mode === "classical") {
      const m = calculateMetrics(overlap, "classical");
      setMetrics(m);
      setClassicalScore(m.overlap);
    }

    if (mode === "quantum" && finalized) {
      setMetrics(calculateMetrics(overlap, "quantum"));
    }
  }, [mode, overlap, finalized]);

  return (
    <div className="mt-10 px-6">
      <div className="w-full glass rounded-2xl p-8 shadow-2xl glow-animate">
        <h2 className="text-2xl font-semibold text-white mb-4">
          {mode === "classical"
            ? "Classical Optimization Output"
            : "Quantum-Inspired Optimization Output"}
        </h2>

        {/* ================= VISUALIZATION ================= */}
        <div className="h-[440px] mb-6">
          <AntennaCanvas
            mode={mode}
            distance={distance}
            superposition={mode === "quantum" && !measured}
            superDistances={superpositionDistances}
            finalized={finalized}
          />
        </div>

        {/* ================= METRIC DASHBOARD ================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <MetricCard
            title="Interference Score"
            value={metrics.overlap}
            color="text-red-400"
            bar="bg-red-500"
          />
          <MetricCard
            title="Network Coverage"
            value={`${metrics.coverage}%`}
            color="text-cyan-400"
            bar="bg-cyan-500"
          />
          <MetricCard
            title="Network Efficiency"
            value={`${metrics.efficiency}%`}
            color="text-green-400"
            bar="bg-green-500"
          />
          <MetricCard
            title="Active Antennas"
            value="5"
            color="text-amber-400"
            bar="bg-amber-500"
          />
        </div>

        {/* ================= IMPROVEMENT MESSAGE ================= */}
        {mode === "quantum" && finalized && classicalScore !== null && (
          <div className="mt-3 text-sm text-green-400 text-right">
            ⬇ Interference reduced by{" "}
            {(classicalScore - metrics.overlap).toFixed(1)} points compared to
            Classical
          </div>
        )}

        {/* ================= EXPORT SUMMARY BUTTON ================= */}
        {mode === "quantum" && finalized && (
          <div className="mt-4 text-right">
            <button
              onClick={() => setShowSummary(true)}
              className="px-5 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition"
            >
              Export Result Summary
            </button>
          </div>
        )}

        {/* ================= SLIDER ================= */}
        <div className="mt-6">
          <label className="text-gray-300">
            Antenna Distance:{" "}
            <span className="text-green-400">{distance}px</span>
          </label>
          <input
            type="range"
            min="80"
            max="300"
            value={distance}
            disabled={finalized}
            onChange={(e) => {
              setDistance(Number(e.target.value));
              setMeasured(false);
              setFinalized(false);
            }}
            className={`w-full mt-2 ${
              finalized ? "opacity-40 cursor-not-allowed" : ""
            }`}
          />
        </div>

        {/* ================= MEASURE BUTTON ================= */}
        {mode === "quantum" && !measured && (
          <div className="mt-4 text-right">
            <button
              onClick={() => {
                setMeasured(true);
                setFinalized(true);
              }}
              className="px-6 py-2 bg-purple-500 rounded-lg font-semibold text-black hover:bg-purple-400 transition"
            >
              Measure & Collapse
            </button>
          </div>
        )}

        {/* ================= STATUS ================= */}
        <div className="mt-4 text-right">
          {mode === "quantum" ? (
            finalized ? (
              <span className="text-green-400 font-semibold">
                ✅ State Measured • Final Result Locked
              </span>
            ) : (
              <span className="text-purple-400 font-semibold animate-pulse">
                ⚛️ Superposition Active • Awaiting Measurement
              </span>
            )
          ) : (
            <span className="text-yellow-400 font-semibold">
              ⚠️ Interference Detected • Reuse Pending
            </span>
          )}
        </div>
      </div>

      {/* ================= SUMMARY MODAL ================= */}
      {showSummary && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-4">
              Optimization Result Summary
            </h3>

            <div className="text-sm text-gray-300 space-y-3">
              <div>
                <h4 className="font-semibold text-yellow-400">
                  Classical Optimization
                </h4>
                <p>Interference Score: {classicalScore}</p>
                <p>Coverage: {metrics.coverage}%</p>
                <p>Efficiency: {metrics.efficiency}%</p>
              </div>

              <div>
                <h4 className="font-semibold text-purple-400">
                  Quantum Optimization
                </h4>
                <p>Interference Score: {metrics.overlap}</p>
                <p>Coverage: {metrics.coverage}%</p>
                <p>Efficiency: {metrics.efficiency}%</p>
              </div>

              <div className="pt-2 border-t border-slate-700 text-green-400">
                ⬇ Interference reduced by{" "}
                {(classicalScore - metrics.overlap).toFixed(1)} points
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setShowSummary(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= METRIC CARD ================= */

function MetricCard({ title, value, color, bar }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      <div className="text-xs text-gray-400 mb-1">{title}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${bar}`} style={{ width: "60%" }} />
      </div>
    </div>
  );
}
