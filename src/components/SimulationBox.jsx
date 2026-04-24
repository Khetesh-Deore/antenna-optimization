// SimulationBox.jsx — Main simulation container

import { useState, useEffect, useMemo, useCallback } from "react";
import AntennaCanvas from "./AntennaCanvas";
import MetricsPanel from "./MetricsPanel";
import ControlPanel from "./ControlPanel";
import ComparisonTable from "./ComparisonTable";
import SummaryModal from "./SummaryModal";
import {
  generateAntennaPositions,
  assignFrequencies,
  calculateMetrics,
  quantumOptimizedPositions,
} from "../utils/antennaUtils";

const CANVAS_W = 560;
const CANVAS_H = 420;

// Generate 4 ghost superposition configs at varied spacings
function buildSuperPositions(count, spacing, canvasW, canvasH) {
  return [0.75, 0.9, 1.1, 1.25].map((factor) =>
    generateAntennaPositions(count, spacing * factor, canvasW, canvasH)
  );
}

export default function SimulationBox({ mode, setMode }) {
  // ── User params ──
  const [params, setParams] = useState({ antennas: 5, spacing: 160, radius: 110 });

  // ── Quantum state ──
  const [measured, setMeasured] = useState(false);
  const [collapsing, setCollapsing] = useState(false);
  const [measuring, setMeasuring] = useState(false);

  // ── Cached scores for comparison ──
  const [classicalMetrics, setClassicalMetrics] = useState(null);
  const [quantumMetrics, setQuantumMetrics] = useState(null);

  // ── Modal ──
  const [showSummary, setShowSummary] = useState(false);

  // Reset quantum state when params change
  useEffect(() => {
    setMeasured(false);
    setCollapsing(false);
    setMeasuring(false);
  }, [params]);

  // ── Classical positions & metrics ──
  const classicalPositions = useMemo(
    () => generateAntennaPositions(params.antennas, params.spacing, CANVAS_W, CANVAS_H),
    [params.antennas, params.spacing]
  );

  const classicalFreqs = useMemo(
    () => assignFrequencies(classicalPositions, params.radius),
    [classicalPositions, params.radius]
  );

  const liveClassicalMetrics = useMemo(
    () => calculateMetrics(classicalPositions, params.radius, CANVAS_W, CANVAS_H, "classical"),
    [classicalPositions, params.radius]
  );

  // ── Quantum positions (optimized after collapse) ──
  const quantumPositions = useMemo(
    () => quantumOptimizedPositions(classicalPositions, params.radius, CANVAS_W, CANVAS_H),
    [classicalPositions, params.radius]
  );

  const quantumFreqs = useMemo(
    () => assignFrequencies(quantumPositions, params.radius),
    [quantumPositions, params.radius]
  );

  const liveQuantumMetrics = useMemo(
    () => calculateMetrics(quantumPositions, params.radius, CANVAS_W, CANVAS_H, "quantum", 22),
    [quantumPositions, params.radius]
  );

  // ── Superposition ghost states ──
  const superPositions = useMemo(
    () => buildSuperPositions(params.antennas, params.spacing, CANVAS_W, CANVAS_H),
    [params.antennas, params.spacing]
  );

  // ── Cache metrics for comparison tab ──
  useEffect(() => {
    setClassicalMetrics(liveClassicalMetrics);
  }, [liveClassicalMetrics]);

  useEffect(() => {
    if (measured) setQuantumMetrics(liveQuantumMetrics);
  }, [measured, liveQuantumMetrics]);

  // ── Measure & Collapse handler ──
  const handleMeasure = useCallback(() => {
    setMeasuring(true);
    setCollapsing(true);
    setTimeout(() => {
      setCollapsing(false);
      setMeasured(true);
      setMeasuring(false);
    }, 1800);
  }, []);

  const handleParamChange = (key, val) => {
    setParams((p) => ({ ...p, [key]: val }));
  };

  // ── Derived display values ──
  const isQuantum = mode === "quantum";
  const isCompare = mode === "compare";
  const superpositionActive = isQuantum && !measured;
  const locked = isQuantum && !measured;

  const displayPositions = isQuantum && measured ? quantumPositions : classicalPositions;
  const displayFreqs = isQuantum && measured ? quantumFreqs : classicalFreqs;
  const displayMetrics = isQuantum
    ? measured
      ? liveQuantumMetrics
      : { interference: "—", coverage: "—", efficiency: "—", antennas: params.antennas }
    : liveClassicalMetrics;

  return (
    <div className="mt-8 px-4 md:px-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

        {/* ── LEFT: Canvas + Metrics ── */}
        <div className="glass rounded-2xl p-6 shadow-2xl glow-animate flex flex-col gap-5">
          {/* Title + status */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-semibold text-white">
              {isCompare
                ? "Comparison View"
                : isQuantum
                ? "Quantum-Inspired Optimization"
                : "Classical Optimization"}
            </h2>
            <StatusBadge mode={mode} measured={measured} measuring={measuring} />
          </div>

          {/* Canvas */}
          {!isCompare && (
            <div className="h-[420px]">
              <AntennaCanvas
                mode={mode}
                positions={displayPositions}
                radius={params.radius}
                freqColors={displayFreqs}
                superPositions={superPositions}
                superposition={superpositionActive}
                collapsing={collapsing}
                finalized={measured}
              />
            </div>
          )}

          {/* Metrics */}
          {!isCompare && typeof displayMetrics.interference === "number" && (
            <MetricsPanel metrics={displayMetrics} mode={mode} />
          )}

          {/* Quantum unmeasured placeholder */}
          {isQuantum && !measured && !measuring && (
            <div className="text-center text-purple-300 text-sm py-2 animate-pulse">
              ⚛️ Superposition Active — metrics will appear after measurement
            </div>
          )}

          {/* Measure button */}
          {isQuantum && !measured && (
            <div className="text-right">
              <button
                onClick={handleMeasure}
                disabled={measuring}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 rounded-lg font-semibold text-black transition"
              >
                {measuring ? "Measuring..." : "Measure & Collapse ⚛️"}
              </button>
            </div>
          )}

          {/* Quantum improvement note */}
          {isQuantum && measured && classicalMetrics && (
            <div className="text-sm text-green-400 text-right">
              ⬇ Interference reduced by{" "}
              <span className="font-bold">
                {(classicalMetrics.interference - liveQuantumMetrics.interference).toFixed(1)} pts
              </span>{" "}
              vs Classical
            </div>
          )}

          {/* Compare tab */}
          {isCompare && (
            <ComparisonTable
              classical={classicalMetrics}
              quantum={quantumMetrics}
              onExport={() => setShowSummary(true)}
            />
          )}

          {/* Compare tab — no quantum data yet */}
          {isCompare && !quantumMetrics && (
            <p className="text-sm text-gray-500 text-center mt-4">
              Switch to ⚛️ Quantum tab and click "Measure & Collapse" to generate quantum results.
            </p>
          )}
        </div>

        {/* ── RIGHT: Controls ── */}
        <div className="flex flex-col gap-4">
          <ControlPanel
            params={params}
            onChange={handleParamChange}
            locked={locked}
          />

          {/* Frequency legend */}
          <FreqLegend freqColors={displayFreqs} count={params.antennas} />

          {/* Export button (quantum done) */}
          {measured && (
            <button
              onClick={() => setShowSummary(true)}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition"
            >
              📋 Export Summary
            </button>
          )}
        </div>
      </div>

      {/* Summary modal */}
      {showSummary && (
        <SummaryModal
          classical={classicalMetrics}
          quantum={quantumMetrics ?? liveQuantumMetrics}
          params={params}
          onClose={() => setShowSummary(false)}
        />
      )}
    </div>
  );
}

/* ── Status badge ── */
function StatusBadge({ mode, measured, measuring }) {
  if (mode === "classical") {
    return (
      <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-400/20">
        ⚠️ Interference Detected
      </span>
    );
  }
  if (measuring) {
    return (
      <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 animate-pulse">
        🔬 Measuring...
      </span>
    );
  }
  if (measured) {
    return (
      <span className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-400/20">
        ✅ Collapsed to Optimal State
      </span>
    );
  }
  return (
    <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-400/20 animate-pulse">
      ⚛️ Superposition Active
    </span>
  );
}

/* ── Frequency legend ── */
function FreqLegend({ freqColors, count }) {
  const unique = [...new Set(freqColors)];
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Frequency Bands</p>
      <div className="flex flex-wrap gap-2">
        {freqColors.slice(0, count).map((c, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-gray-300">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ background: c, boxShadow: `0 0 6px ${c}` }}
            />
            A{i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
