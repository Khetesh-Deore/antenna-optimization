// HexGrid.jsx — Full-page decorative hexagonal background

export default function HexGrid() {
  const size = 50;
  const rows = 20;
  const cols = 22;

  const hexPoints = (x, y) =>
    [0, 1, 2, 3, 4, 5]
      .map((i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        return `${x + size * Math.cos(angle)},${y + size * Math.sin(angle)}`;
      })
      .join(" ");

  return (
    <svg className="fixed inset-0 w-full h-full z-0 opacity-[0.07] pointer-events-none">
      {[...Array(rows)].map((_, r) =>
        [...Array(cols)].map((_, c) => {
          const x = c * size * 1.732 + (r % 2) * size * 0.866;
          const y = r * size * 1.5;
          return (
            <polygon
              key={`${r}-${c}`}
              points={hexPoints(x, y)}
              fill="none"
              stroke="#22c55e"
              strokeWidth="1"
            />
          );
        })
      )}
    </svg>
  );
}
