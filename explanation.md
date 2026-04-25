# Antenna Placement Optimization — Complete Project Explanation

## What This Project Does

This is an interactive **5G Antenna Placement Optimization Simulator** built as a single-page React application. It lets you configure a network of antennas and compare two optimization strategies side by side:

- **Classical Approach** — Greedy heuristic algorithm that places antennas and calculates interference in real time
- **Quantum-Inspired Approach** — Simulates a Quantum Approximate Optimization Algorithm (QAOA) that explores multiple configurations simultaneously (superposition), then collapses to the minimum-energy layout

The goal is to visually demonstrate why quantum-inspired methods can outperform classical greedy approaches for network optimization problems.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI framework (hooks only, no class components) |
| Vite 5 | Build tool and dev server |
| Tailwind CSS 3 | Utility-first styling |
| PostCSS + Autoprefixer | CSS processing |
| SVG (inline) | All visualizations — no chart libraries |
| Vercel | Deployment platform |

No external UI libraries, no Redux, no routing — pure React with local state.

---

## Project Structure

```
antenna-optimization/
├── src/
│   ├── main.jsx                    # React entry point
│   ├── App.jsx                     # Root component, holds activeTab state
│   ├── index.css                   # Global styles, Tailwind, glass/glow classes
│   ├── App.css                     # Minimal (mostly unused)
│   ├── utils/
│   │   └── antennaUtils.js         # ALL math and algorithm logic
│   └── components/
│       ├── Header.jsx              # Page title + badge row
│       ├── Tabs.jsx                # Classical / Quantum / Compare tab switcher
│       ├── HexGrid.jsx             # Full-page decorative SVG hex background
│       ├── SimulationBox.jsx       # Main container — state, layout, orchestration
│       ├── AntennaCanvas.jsx       # SVG visualization of antenna network
│       ├── ControlPanel.jsx        # Three user input sliders
│       ├── MetricsPanel.jsx        # Four metric cards with progress bars
│       ├── ComparisonTable.jsx     # Side-by-side table + bar chart
│       └── SummaryModal.jsx        # Export modal with copy-to-clipboard
├── public/
│   └── vite.svg
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json                     # Vercel deployment config
└── explanation.md                  # This file
```

---

## User Inputs

All three inputs are sliders in the `ControlPanel` component. They update in real time and immediately recalculate all positions and metrics.

| Input | Range | Default | Effect |
|---|---|---|---|
| Number of Antennas | 2 – 10 | 5 | Controls how many antenna nodes are placed on the canvas |
| Antenna Spacing | 50 – 300 px | 160 px | Controls the layout radius — how far apart antennas are placed |
| Coverage Radius | 50 – 200 px | 110 px | Controls the size of each antenna's coverage circle |

During quantum superposition (before measurement), all sliders are **locked** to prevent state changes mid-simulation.

---

## Core Math — `antennaUtils.js`

This file contains every algorithm and formula. Nothing is hardcoded in components.

### `generateAntennaPositions(count, spacing, canvasW, canvasH)`
Places antennas evenly on a circle centered in the canvas.

```
angle_i = (2π × i / count) − π/2
x_i = cx + layoutRadius × cos(angle_i)
y_i = cy + layoutRadius × sin(angle_i)
```

`layoutRadius = min(spacing × 0.75, maxSafeRadius)` — clamped so antennas never clip the canvas edge. A 60px margin is enforced on all sides.

### `circleOverlapArea(r, d)`
Calculates the lens-shaped intersection area between two circles of equal radius `r` separated by distance `d`. This is the standard geometric lens formula:

```
area = 2r² × arccos(d / 2r) − (d/2) × √(4r² − d²)
```

Returns 0 if circles don't overlap (`d ≥ 2r`), returns full circle area if they're concentric (`d = 0`).

### `totalInterference(positions, radius)`
Sums the pairwise overlap area for every combination of antennas:

```
total = Σ circleOverlapArea(r, dist(A_i, A_j))  for all i < j
```

### `assignFrequencies(positions, radius)`
Greedy graph-coloring algorithm. Two antennas are "adjacent" if their coverage circles overlap (`dist < 2r`). Adjacent antennas get different frequency bands (colors). This minimizes co-channel interference.

```
for each antenna i:
  collect frequencies used by all neighbors j < i
  assign the lowest frequency not in that set
```

7 frequency colors are available: green, blue, purple, orange, red, cyan, yellow.

### `calculateMetrics(positions, radius, canvasW, canvasH, mode, quantumBoost)`
Derives the 4 displayed metrics from raw interference:

```
interferenceScore = (totalInterference / maxPossibleOverlap) × 100
  + 8  (classical penalty)
  − 22 (quantum boost, after measurement)

coverage   = clamp(100 − interference × 0.45,  30, 95)
efficiency = clamp(coverage − interference × 0.5 − antennas × 1.5 + 60,  10, 98)
```

### `quantumOptimizedPositions(positions, radius, canvasW, canvasH)`
Spreads each antenna 22% further from the canvas center, reducing overlap:

```
x_new = cx + (x − cx) × 1.22
y_new = cy + (y − cy) × 1.22
```

Result is clamped to the safe margin. This simulates the quantum optimizer finding a lower-energy (less overlapping) configuration.

### `computeQAOAEnergy(positions, radius)`
A single scalar representing the "cost" of the current configuration:

```
energy = totalInterference / totalPairwiseSpread
```

Lower energy = better layout. This is displayed live and animates downward during the QAOA steps.

---

## Component Breakdown

### `App.jsx`
Root component. Holds `activeTab` state (`"classical"` | `"quantum"` | `"compare"`). Renders `Header`, `Tabs`, `SimulationBox`, and the full-page `HexGrid` background.

### `SimulationBox.jsx`
The main orchestrator. Owns all simulation state:

| State | Type | Purpose |
|---|---|---|
| `params` | object | `{ antennas, spacing, radius }` — user inputs |
| `measured` | bool | Whether quantum measurement has been triggered |
| `collapsing` | bool | True during the 1.8s collapse animation |
| `measuring` | bool | True while QAOA steps are running |
| `classicalMetrics` | object | Cached classical results for comparison tab |
| `quantumMetrics` | object | Cached quantum results (set after measurement) |
| `qaoa` | object | `{ step, energy }` — QAOA animation progress |
| `history` | array | Last 10 simulation runs |
| `showSummary` | bool | Controls export modal visibility |

All positions and metrics are derived with `useMemo` — they recompute automatically when `params` changes.

The QAOA animation runs 8 steps via `setInterval` (220ms each), decreasing energy by 65% total, then finalizes the measurement.

### `AntennaCanvas.jsx`
Pure SVG visualization. Renders in layers (bottom to top):

1. Hex grid background
2. Canvas border
3. Superposition ghost states (quantum only, pre-measurement)
4. Overlap heatmap blobs (red = classical interference, green = quantum optimized)
5. Coverage fill (radial gradient per antenna)
6. Coverage ring (dashed + pulsing in quantum superposition)
7. Collapse ripple wave (animates outward on measurement)
8. Entanglement lines (quantum post-measurement, same-frequency pairs)
9. Antenna nodes (tower icon + ID label + frequency badge)
10. HUD labels (mode label top-left, overlap count top-right)

### `ControlPanel.jsx`
Three range sliders with colored value displays. Sliders are disabled and show a lock notice during quantum superposition.

### `MetricsPanel.jsx`
Four cards: Interference Score, Network Coverage, Network Efficiency, Active Antennas. Each card shows:
- Icon + title
- Large numeric value
- Gradient progress bar
- Trend arrow (▲/▼) comparing to previous run

### `ComparisonTable.jsx`
Only visible on the Compare tab. Shows:
- Score banner (Classical Wins X vs Quantum Wins Y + Overall Winner)
- Full metrics table with winner highlighting and % improvement column
- Horizontal bar chart for Interference, Coverage, Efficiency

### `SummaryModal.jsx`
Modal overlay showing Classical results, Quantum results, and the delta (Quantum Advantage) for all 4 metrics. Includes a "Copy to Clipboard" button that formats the data as plain text.

---

## The Three Tabs

### Classical Tab
- Antennas placed in circular layout using greedy positioning
- Metrics update live as sliders move
- Red heatmap blobs show interference zones
- Status badge: "⚠️ Interference Detected"

### Quantum Tab
**Phase 1 — Superposition (before measurement)**
- 4 ghost configurations shown simultaneously at different spacings (0.70×, 0.86×, 1.10×, 1.28× of current spacing)
- Coverage rings pulse and glow
- Sliders are locked
- QAOA energy score displayed
- Status badge: "⚛️ Superposition Active"

**Phase 2 — Measurement (click "Measure & Collapse")**
- QAOA progress bar animates through 8 steps (~1.8 seconds)
- Energy value decreases with each step
- Ripple wave radiates from each antenna
- Ghost states fade out

**Phase 3 — Collapsed (after measurement)**
- Antennas move to optimized positions (22% more spread)
- Green heatmap replaces red
- Entanglement lines appear between same-frequency antennas
- Metrics panel shows improved values
- Quantum advantage banner shows interference reduction and efficiency gain
- Status badge: "✅ Collapsed to Optimal State"

### Compare Tab
- Requires quantum measurement to have been performed first
- Shows full side-by-side comparison table
- Bar chart visualizes all three key metrics
- Export Summary button opens the modal

---

## Simulation History

Every time a quantum measurement completes, an entry is saved to the history log (max 10 entries). Each entry records:
- Timestamp
- Configuration (antennas, spacing, radius)
- Classical interference score
- Quantum interference score
- Improvement in points

The history panel is toggled via the "Show/Hide History" button in the right panel.

---

## Deployment

The project is deployed on Vercel. The `vercel.json` file explicitly configures:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install"
}
```

To redeploy after changes:
```bash
vercel --prod
```

Or push to the connected GitHub repository for automatic deployment.

---

## How to Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

To build for production:
```bash
npm run build
npm run preview
```

---

## Key Design Decisions

**Why SVG instead of Canvas API or a chart library?**
SVG is declarative, works naturally with React's render cycle, supports CSS transitions and filters, and produces crisp output at any resolution. No external dependencies needed.

**Why local state instead of Redux/Context?**
The app is a single page with one main component tree. All state flows downward from `SimulationBox`. There's no cross-tree state sharing that would justify a global store.

**Why `useMemo` for positions and metrics?**
Position and metric calculations run on every render. `useMemo` ensures they only recompute when their actual dependencies (`params`, `mode`) change — not on unrelated state updates like `showHistory` toggling.

**Why simulate QAOA with `setInterval` instead of a real quantum library?**
Real QAOA requires quantum hardware or a quantum circuit simulator (like Qiskit). This project is a visual educational tool running entirely in the browser. The simulation captures the conceptual behavior — superposition of states, energy minimization, wavefunction collapse — without requiring a quantum backend.
