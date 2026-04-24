export default function Tabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex justify-center gap-4 mt-6">
      <button
        onClick={() => setActiveTab("classical")}
        className={`px-6 py-2 rounded-lg font-semibold transition ${
          activeTab === "classical"
            ? "bg-green-500 text-black"
            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
        }`}
      >
        🔧 Classical
      </button>
      <button
        onClick={() => setActiveTab("quantum")}
        className={`px-6 py-2 rounded-lg font-semibold transition ${
          activeTab === "quantum"
            ? "bg-purple-500 text-black"
            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
        }`}
      >
        ⚛️ Quantum
      </button>
      <button
        onClick={() => setActiveTab("compare")}
        className={`px-6 py-2 rounded-lg font-semibold transition ${
          activeTab === "compare"
            ? "bg-cyan-500 text-black"
            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
        }`}
      >
        📊 Compare
      </button>
    </div>
  );
}
