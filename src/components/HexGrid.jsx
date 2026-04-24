export default function HexGrid() {
  const size = 55;
  const rows = 18;
  const cols = 18;

  const hex = (x, y) => `
    ${x},${y - size}
    ${x + size * 0.87},${y - size / 2}
    ${x + size * 0.87},${y + size / 2}
    ${x},${y + size}
    ${x - size * 0.87},${y + size / 2}
    ${x - size * 0.87},${y - size / 2}
  `;

  return (
    <svg className="fixed inset-0 w-full h-full z-0 opacity-10">
      {[...Array(rows)].map((_, r) =>
        [...Array(cols)].map((_, c) => {
          const x = 80 + c * size * 1.75 + (r % 2) * size * 0.9;
          const y = 80 + r * size * 1.5;
          return (
            <polygon
              key={`${r}-${c}`}
              points={hex(x, y)}
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
