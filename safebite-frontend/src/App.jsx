import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Scan, Search, ShieldAlert } from 'lucide-react';
import Scanner from './Scanner';
import Result from './Result'; // Import Scanner

// 1. Home Page Component
const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="bg-white p-4 rounded-full shadow-lg inline-block mb-4">
          <ShieldAlert size={48} className="text-brand-red" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight">SafeBite</h1>
        <p className="text-gray-500 mt-2">Eat Safe. Live Healthy.</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        {/* Navigate to Scanner */}
        <button 
          onClick={() => navigate('/scan')}
          className="w-full bg-brand-green hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all transform hover:scale-105"
        >
          <Scan size={24} />
          <span>Scan Barcode</span>
        </button>

        <button className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-6 rounded-xl shadow-md border border-gray-200 flex items-center justify-center gap-3 transition-all">
          <Search size={24} />
          <span>Search Product</span>
        </button>
      </div>
      
      <p className="mt-12 text-sm text-gray-400">Powered by SafeBite Intelligence Engine</p>
    </div>
  );
};

// 2. Main App with Routes
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/scan" element={<Scanner />} />
      <Route path="/result" element={<Result />} />
      {/* Result Page hum agle step me banayenge */}
      <Route path="/result" element={<div className='p-10 text-center'>Result Page Coming Soon...</div>} />
    </Routes>
  );
}

export default App;