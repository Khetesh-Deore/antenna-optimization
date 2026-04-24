// ============================================================
// antennaUtils.js — Core math for antenna optimization
// ============================================================

const CANVAS_W = 600;
const CANVAS_H = 460;

/**
 * Generate antenna positions in a circular layout.
 * Positions are guaranteed to stay inside canvas with safe margin.
 */
export function generateAntennaPositions(count, spacing, canvasW = CANVAS_W, canvasH = CANVAS_H) {
  const cx = canvasW / 2;
  const cy = canvasH / 2;

  if (count === 1) return [{ x: cx, y: cy }];

  // Safe margin so antennas + their labels never clip the edge
  const MARGIN = 60;
  const maxR = Math.min(canvasW, canvasH) / 2 - MARGIN;

  // Layout radius: scale with spacing but clamp to safe area
  const layoutRadius = Math.min(spacing * 0.75, maxR);

  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return {
      x: Math.round(cx + layoutRadius * Math.cos(angle)),
      y: Math.round(cy + layoutRadius * Math.sin(angle)),
    };
  });
}

/** Lens-formula overlap area between two circles of equal radius r, distance d apart */
export function circleOverlapArea(r, d) {
  if (d >= 2 * r) return 0;
  if (d <= 0) return Math.PI * r * r;
  const cosArg = Math.min(Math.max(d / (2 * r), -1), 1);
  const part1 = 2 * r * r * Math.acos(cosArg);
  const part2 = 0.5 * d * Math.sqrt(Math.max(4 * r * r - d * d, 0));
  return Math.max(part1 - part2, 0);
}

/** Euclidean distance between two points */
export function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/** Total pairwise interference (sum of all overlap areas) */
export function totalInterference(positions, radius) {
  let total = 0;
  for (let i = 0; i < positions.length; i++)
    for (let j = i + 1; j < positions.length; j++)
      total += circleOverlapArea(radius, dist(positions[i], positions[j]));
  return total;
}

/** Greedy graph-coloring frequency assignment */
export function assignFrequencies(positions, radius) {
  const FREQ_COLORS = [
    "#22c55e", // green
    "#3b82f6", // blue
    "#a855f7", // purple
    "#f97316", // orange
    "#ef4444", // red
    "#06b6d4", // cyan
    "#eab308", // yellow
  ];
  const freq = new Array(positions.length).fill(-1);
  for (let i = 0; i < positions.length; i++) {
    const used = new Set();
    for (let j = 0; j < i; j++) {
      if (dist(positions[i], positions[j]) < 2 * radius) used.add(freq[j]);
    }
    let f = 0;
    while (used.has(f)) f++;
    freq[i] = f;
  }
  return freq.map((f) => FREQ_COLORS[f % FREQ_COLORS.length]);
}

/** Calculate all 4 metrics */
export function calculateMetrics(positions, radius, canvasW = CANVAS_W, canvasH = CANVAS_H, mode, quantumBoost = 0) {
  const raw = totalInterference(positions, radius);
  const maxOverlap = Math.PI * radius * radius * positions.length;
  let interference = Math.min((raw / Math.max(maxOverlap, 1)) * 100, 100);
  if (mode === "classical") interference = Math.min(interference + 8, 100);
  if (mode === "quantum")   interference = Math.max(interference - quantumBoost, 5);
  const coverage   = Math.min(Math.max(100 - interference * 0.45, 30), 95);
  const efficiency = Math.min(Math.max(coverage - interference * 0.5 - positions.length * 1.5 + 60, 10), 98);
  return {
    interference: Number(interference.toFixed(1)),
    coverage:     Number(coverage.toFixed(1)),
    efficiency:   Number(efficiency.toFixed(1)),
    antennas:     positions.length,
  };
}

/**
 * Quantum-optimized positions: spread antennas outward from center
 * to reduce overlap, clamped inside canvas with margin.
 */
export function quantumOptimizedPositions(positions, radius, canvasW = CANVAS_W, canvasH = CANVAS_H) {
  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const MARGIN = 60;

  return positions.map((p) => {
    const dx = p.x - cx || 0.01;
    const dy = p.y - cy || 0.01;
    const nx = cx + dx * 1.22;
    const ny = cy + dy * 1.22;
    return {
      x: Math.round(Math.min(Math.max(nx, MARGIN), canvasW - MARGIN)),
      y: Math.round(Math.min(Math.max(ny, MARGIN), canvasH - MARGIN)),
    };
  });
}

/** QAOA-style energy score (lower = better) */
export function computeQAOAEnergy(positions, radius) {
  const interference = totalInterference(positions, radius);
  const spread = positions.reduce((acc, p, i) => {
    positions.forEach((q, j) => { if (i !== j) acc += dist(p, q); });
    return acc;
  }, 0);
  return interference / Math.max(spread, 1);
}

/** History entry for simulation log */
export function makeHistoryEntry(params, classicalM, quantumM) {
  return {
    id: Date.now(),
    time: new Date().toLocaleTimeString(),
    antennas: params.antennas,
    spacing: params.spacing,
    radius: params.radius,
    classicalInterference: classicalM.interference,
    quantumInterference: quantumM.interference,
    improvement: (classicalM.interference - quantumM.interference).toFixed(1),
  };
}
