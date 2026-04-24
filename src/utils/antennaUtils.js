// ============================================================
// antennaUtils.js — All core math for antenna optimization
// ============================================================

/**
 * Generate antenna positions dynamically in a circular/grid layout
 * centered in the SVG canvas.
 */
export function generateAntennaPositions(count, spacing, canvasW, canvasH) {
  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const positions = [];

  if (count === 1) {
    return [{ x: cx, y: cy }];
  }

  // Distribute evenly on a circle whose radius scales with spacing
  const layoutRadius = Math.min(spacing * 0.9, Math.min(canvasW, canvasH) * 0.35);

  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    positions.push({
      x: cx + layoutRadius * Math.cos(angle),
      y: cy + layoutRadius * Math.sin(angle),
    });
  }

  return positions;
}

/**
 * Lens-formula overlap area between two circles of equal radius r
 * separated by distance d.
 */
export function circleOverlapArea(r, d) {
  if (d >= 2 * r) return 0;
  if (d <= 0) return Math.PI * r * r;
  const part1 = 2 * r * r * Math.acos(d / (2 * r));
  const part2 = 0.5 * d * Math.sqrt(4 * r * r - d * d);
  return Math.max(part1 - part2, 0);
}

/**
 * Euclidean distance between two points.
 */
export function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Total pairwise interference (sum of all overlap areas).
 */
export function totalInterference(positions, radius) {
  let total = 0;
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      total += circleOverlapArea(radius, dist(positions[i], positions[j]));
    }
  }
  return total;
}

/**
 * Estimate network coverage % using a Monte Carlo sampling approach.
 * Samples random points in the canvas and checks if any antenna covers them.
 */
export function estimateCoverage(positions, radius, canvasW, canvasH, samples = 1200) {
  let hits = 0;
  for (let i = 0; i < samples; i++) {
    const px = Math.random() * canvasW;
    const py = Math.random() * canvasH;
    for (const a of positions) {
      if (dist({ x: px, y: py }, a) <= radius) {
        hits++;
        break;
      }
    }
  }
  return (hits / samples) * 100;
}

/**
 * Assign frequency bands using a greedy graph-coloring approach.
 * Adjacent antennas (overlapping coverage) get different frequencies.
 */
export function assignFrequencies(positions, radius) {
  const n = positions.length;
  const freq = new Array(n).fill(-1);
  const FREQ_COLORS = ["#22c55e", "#3b82f6", "#a855f7", "#f97316", "#ef4444", "#06b6d4", "#eab308"];

  for (let i = 0; i < n; i++) {
    const usedByNeighbors = new Set();
    for (let j = 0; j < i; j++) {
      if (dist(positions[i], positions[j]) < 2 * radius) {
        usedByNeighbors.add(freq[j]);
      }
    }
    let f = 0;
    while (usedByNeighbors.has(f)) f++;
    freq[i] = f;
  }

  return freq.map((f) => FREQ_COLORS[f % FREQ_COLORS.length]);
}

/**
 * Calculate all 4 metrics for a given configuration.
 */
export function calculateMetrics(positions, radius, canvasW, canvasH, mode, quantumBoost = 0) {
  const rawInterference = totalInterference(positions, radius);
  const singleCircleArea = Math.PI * radius * radius;
  const maxPossibleOverlap = singleCircleArea * positions.length;

  // Normalize interference to 0–100 scale
  let interferenceScore = Math.min((rawInterference / Math.max(maxPossibleOverlap, 1)) * 100, 100);

  if (mode === "classical") interferenceScore = Math.min(interferenceScore + 8, 100);
  if (mode === "quantum") interferenceScore = Math.max(interferenceScore - quantumBoost, 5);

  const coverage = Math.min(Math.max(100 - interferenceScore * 0.45, 30), 95);
  const efficiency = Math.min(
    Math.max(coverage - interferenceScore * 0.5 - positions.length * 1.5 + 60, 10),
    98
  );

  return {
    interference: Number(interferenceScore.toFixed(1)),
    coverage: Number(coverage.toFixed(1)),
    efficiency: Number(efficiency.toFixed(1)),
    antennas: positions.length,
  };
}

/**
 * Generate quantum-optimized positions by slightly spreading antennas
 * to minimize overlap while keeping them within canvas bounds.
 */
export function quantumOptimizedPositions(positions, radius, canvasW, canvasH) {
  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const margin = radius * 0.3;

  return positions.map((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    const pushFactor = 1.18; // spread outward ~18%
    return {
      x: Math.min(Math.max(cx + dx * pushFactor, margin), canvasW - margin),
      y: Math.min(Math.max(cy + dy * pushFactor, margin), canvasH - margin),
    };
  });
}
