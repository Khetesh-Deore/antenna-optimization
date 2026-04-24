export default function Tabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex justify-center gap-4 mt-6">
      <button
        onClick={() => setActiveTab("classical")}
        className={`px-6 py-2 rounded-lg font-medium transition
          ${activeTab === "classical"
            ? "bg-green-500 text-black"
            : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
      >
        Classical-Inspired
      </button>

      <button
        onClick={() => setActiveTab("quantum")}
        className={`px-6 py-2 rounded-lg font-medium transition
          ${activeTab === "quantum"
            ? "bg-purple-500 text-black"
            : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
      >
        Quantum-Inspired
      </button>
    </div>
  );
}
