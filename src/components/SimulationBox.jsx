// SimulationBox.jsx — Main simulation container

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  computeQAOAEnergy,
  makeHistoryEntry,
} from "../utils/antennaUtils";

const CANVAS_W = 560;
const CANVAS_H = 420;

function buildSuperPositions(count, spacing, canvasW, canvasH) {
  return [0.72, 0.88, 1.1, 1.28].map((f) =>
    generateAntennaPositions(count, spacing * f, canvasW, canvasH)
  );
}

export default function SimulationBox({ mode }) {
  const [params, setParams]       = useState({ antennas: 5, spacing: 160, radius: 110 });
  const [measured, setMeasured]   = useState(false);
  const [collapsing, setCollapsing] = useState(false);
  const [measuring, setMeasuring] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [history, setHistory]     = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [qaoa, setQaoa]           = useState({ step: 0, energy: null, running: false });
  const qaaoRef = useRef(null);

  // Cached metrics for compare tab
  const [classicalMetrics, setClassicalMetrics] = useState(null);
  const [quantumMetrics, setQuantumMetrics]     = useState(null);
  const [prevClassical, setPrevClassical]       = useState(null);

  // Reset quantum on param change
  useEffect(() => {
    setMeasured(false);
    setCollapsing(false);
    setMeasuring(false);
    setQaoa({ step: 0, energy: null, running: false });
    if (qaaoRef.current) clearInterval(qaaoRef.current);
  }, [params]);

  // ── Positions ──
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

  const superPositions = useMemo(
    () => buildSuperPositions(params.antennas, params.spacing, CANVAS_W, CANVAS_H),
    [params.antennas, params.spacing]
  );

  // Sync classical metrics
  useEffect(() => {
    setPrevClassical(classicalMetrics);
    setClassicalMetrics(liveClassicalMetrics);
  }, [liveClassicalMetrics]);

  useEffect(() => {
    if (measured) setQuantumMetrics(liveQuantumMetrics);
  }, [measured, liveQuantumMetrics]);

  // ── QAOA step animation ──
  const startQAOA = useCallback(() => {
    setMeasuring(true);
    setCollapsing(true);
    setQaoa({ step: 0, energy: null, running: true });

    let step = 0;
    const totalSteps = 8;
    const initialEnergy = computeQAOAEnergy(classicalPositions, params.radius);

    qaaoRef.current = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      const energy = initialEnergy * (1 - progress * 0.65);
      setQaoa({ step, energy: energy.toFixed(4), running: step < totalSteps });

      if (step >= totalSteps) {
        clearInterval(qaaoRef.current);
        setTimeout(() => {
          setCollapsing(false);
          setMeasured(true);
          setMeasuring(false);
        }, 300);
      }
    }, 220);
  }, [classicalPositions, params.radius]);

  // Save to history after measurement
  useEffect(() => {
    if (measured && classicalMetrics && liveQuantumMetrics) {
      setHistory((h) => [makeHistoryEntry(params, classicalMetrics, liveQuantumMetrics), ...h.slice(0, 9)]);
    }
  }, [measured]);

  const handleParamChange = (key, val) => setParams((p) => ({ ...p, [key]: val }));

  const isQuantum = mode === "quantum";
  const isCompare = mode === "compare";
  const superpositionActive = isQuantum && !measured;
  const locked = isQuantum && !measured;

  const displayPositions = isQuantum && measured ? quantumPositions : classicalPositions;
  const displayFreqs     = isQuantum && measured ? quantumFreqs     : classicalFreqs;
  const displayMetrics   = isQuantum
    ? measured ? liveQuantumMetrics : null
    : liveClassicalMetrics;

  const qaaoEnergy = computeQAOAEnergy(
    isQuantum && measured ? quantumPositions : classicalPositions,
    params.radius
  );

  return (
    <div className="mt-8 px-4 md:px-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-6">

        {/* ── LEFT PANEL ── */}
        <div className="glass rounded-2xl p-6 shadow-2xl glow-animate flex flex-col gap-5">

          {/* Header row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-semibold text-white">
              {isCompare ? "📊 Comparison View"
                : isQuantum ? "⚛️ Quantum-Inspired Optimization"
                : "🔧 Classical Optimization"}
            </h2>
            <StatusBadge mode={mode} measured={measured} measuring={measuring} />
          </div>

          {/* Canvas */}
          {!isCompare && (
            <div className="h-[420px] rounded-xl overflow-hidden border border-slate-800">
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

          {/* QAOA progress bar */}
          {isQuantum && (measuring || measured) && (
            <QAOAProgress step={qaoa.step} energy={qaoa.energy} measured={measured} />
          )}

          {/* Metrics */}
          {!isCompare && displayMetrics && (
            <MetricsPanel
              metrics={displayMetrics}
              mode={mode}
              prevMetrics={mode === "classical" ? prevClassical : null}
            />
          )}

          {/* Superposition hint */}
          {isQuantum && !measured && !measuring && (
            <div className="text-center text-purple-300/80 text-sm py-1 animate-pulse">
              ⚛️ Superposition Active — all candidate states visible simultaneously
            </div>
          )}

          {/* Measure button */}
          {isQuantum && !measured && (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="text-xs text-gray-500">
                QAOA Energy: <span className="text-purple-400 font-mono">{qaaoEnergy.toFixed(4)}</span>
              </div>
              <button onClick={startQAOA} disabled={measuring}
                className="px-6 py-2.5 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 rounded-lg font-semibold text-black transition flex items-center gap-2">
                {measuring
                  ? <><span className="animate-spin">⚛️</span> Measuring...</>
                  : "Measure & Collapse ⚛️"}
              </button>
            </div>
          )}

          {/* Improvement note */}
          {isQuantum && measured && classicalMetrics && (
            <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <span className="text-sm text-gray-400">Quantum advantage</span>
              <span className="text-green-400 font-bold text-sm">
                ⬇ {(classicalMetrics.interference - liveQuantumMetrics.interference).toFixed(1)} pts interference reduction
                &nbsp;·&nbsp;
                ⬆ {(liveQuantumMetrics.efficiency - classicalMetrics.efficiency).toFixed(1)}% efficiency gain
              </span>
            </div>
          )}

          {/* Compare tab content */}
          {isCompare && (
            <>
              {classicalMetrics && quantumMetrics
                ? <ComparisonTable classical={classicalMetrics} quantum={quantumMetrics} onExport={() => setShowSummary(true)} />
                : <div className="text-center py-12 text-gray-500">
                    <p className="text-4xl mb-3">⚛️</p>
                    <p className="text-sm">Switch to the <span className="text-purple-400 font-semibold">Quantum</span> tab and click <span className="text-purple-400 font-semibold">Measure & Collapse</span> to generate quantum results.</p>
                  </div>
              }
            </>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex flex-col gap-4">
          <ControlPanel params={params} onChange={handleParamChange} locked={locked} />

          {/* Frequency legend */}
          <FreqLegend freqColors={displayFreqs} count={params.antennas} />

          {/* QAOA energy card */}
          <EnergyCard energy={qaaoEnergy} measured={measured} mode={mode} />

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            {measured && (
              <button onClick={() => setShowSummary(true)}
                className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-semibold transition">
                📋 Export Summary
              </button>
            )}
            <button onClick={() => setShowHistory((v) => !v)}
              className="w-full px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition">
              🕓 {showHistory ? "Hide" : "Show"} History ({history.length})
            </button>
          </div>

          {/* History log */}
          {showHistory && <HistoryLog history={history} />}
        </div>
      </div>

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

/* ── QAOA Progress ── */
function QAOAProgress({ step, energy, measured }) {
  const totalSteps = 8;
  const pct = Math.min((step / totalSteps) * 100, 100);
  return (
    <div className="bg-slate-900/60 border border-purple-500/20 rounded-xl p-4">
      <div className="flex justify-between text-xs text-gray-400 mb-2">
        <span className="font-semibold text-purple-400">QAOA Optimization Steps</span>
        <span className="font-mono">{step}/{totalSteps}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
        <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">Energy: <span className="text-purple-400 font-mono">{energy ?? "—"}</span></span>
        <span className={measured ? "text-green-400" : "text-purple-400 animate-pulse"}>
          {measured ? "✅ Converged" : "⚛️ Annealing..."}
        </span>
      </div>
    </div>
  );
}

/* ── Energy card ── */
function EnergyCard({ energy, measured, mode }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">QAOA Energy Score</p>
      <div className="flex items-end gap-2">
        <span className={`text-2xl font-bold font-mono tabular-nums ${
          mode === "quantum" && measured ? "text-green-400" : "text-purple-400"
        }`}>
          {energy.toFixed(4)}
        </span>
        <span className="text-xs text-gray-500 mb-1">lower = better</span>
      </div>
      <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-600 to-green-500 rounded-full transition-all duration-700"
          style={{ width: `${Math.max(5, 100 - energy * 800)}%` }} />
      </div>
    </div>
  );
}

/* ── Frequency legend ── */
function FreqLegend({ freqColors, count }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Frequency Bands</p>
      <div className="grid grid-cols-5 gap-2">
        {freqColors.slice(0, count).map((c, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="w-4 h-4 rounded-full"
              style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
            <span className="text-xs text-gray-400">A{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── History log ── */
function HistoryLog({ history }) {
  if (!history.length) return (
    <div className="glass rounded-2xl p-4 text-xs text-gray-500 text-center">
      No runs yet. Measure a quantum state to log results.
    </div>
  );
  return (
    <div className="glass rounded-2xl p-4 max-h-64 overflow-y-auto">
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Simulation History</p>
      <div className="flex flex-col gap-2">
        {history.map((h) => (
          <div key={h.id} className="bg-slate-900/60 rounded-lg px-3 py-2 text-xs">
            <div className="flex justify-between text-gray-400 mb-1">
              <span className="font-mono">{h.time}</span>
              <span>{h.antennas} ant · {h.spacing}px · r{h.radius}</span>
            </div>
            <div className="flex justify-between">
              <span>C: <span className="text-red-400 font-semibold">{h.classicalInterference}</span></span>
              <span>Q: <span className="text-purple-400 font-semibold">{h.quantumInterference}</span></span>
              <span className="text-green-400 font-semibold">↓{h.improvement} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Status badge ── */
function StatusBadge({ mode, measured, measuring }) {
  if (mode === "compare") return (
    <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-400/20">
      📊 Side-by-Side Analysis
    </span>
  );
  if (mode === "classical") return (
    <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-400/20">
      ⚠️ Interference Detected
    </span>
  );
  if (measuring) return (
    <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 animate-pulse">
      🔬 Measuring...
    </span>
  );
  if (measured) return (
    <span className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-400/20">
      ✅ Collapsed to Optimal State
    </span>
  );
  return (
    <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-400/20 animate-pulse">
      ⚛️ Superposition Active
    </span>
  );
}
