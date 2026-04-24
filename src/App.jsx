// src/App.jsx

import { useState } from "react";
import Header from "./components/Header";
import Tabs from "./components/Tabs";
import SimulationBox from "./components/SimulationBox";
import HexGrid from "./components/HexGrid";

function App() {
  const [activeTab, setActiveTab] = useState("classical");

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#020617] via-black to-[#020617] overflow-hidden text-white">
      {/* FULL BACKGROUND GRID */}
      <HexGrid />

      {/* CONTENT ABOVE GRID */}
      <div className="relative z-10">
        <Header />
        <Tabs
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
          }}
        />
        <SimulationBox mode={activeTab} />
      </div>
    </div>
  );
}

export default App;
