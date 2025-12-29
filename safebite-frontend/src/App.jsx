import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Scan, Search, ShieldAlert, Activity, Bell, AlertTriangle, Info, Download } from 'lucide-react'; // Removed Languages, UserCircle from imports as they are in TopBar now
import { getDeviceId } from './utils/device';
import { getLanguage, setLanguage } from './utils/lang';

// Import Pages & Components
import Scanner from './Scanner';
import Result from './Result';
import HealthProfile from './HealthProfile';
import PoisonLibrary from './PoisonLibrary';
import AdminPanel from './AdminPanel';
import BottomNav from './BottomNav';
import TopBar from './TopBar'; // 👈 NEW IMPORT

// Helper
const haptic = () => { if (navigator.vibrate) navigator.vibrate(15); };

const Home = () => {
  const navigate = useNavigate();
  const deviceId = getDeviceId();
  const API_URL = import.meta.env.VITE_API_URL;
  
  const [todayScore, setTodayScore] = useState(0);
  const [currentLang, setCurrentLang] = useState(getLanguage());
  const [alerts, setAlerts] = useState([]);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const toggleLang = () => {
      haptic();
      const newLang = currentLang === 'en' ? 'hi' : 'en';
      setLanguage(newLang);
      setCurrentLang(newLang);
  };

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(prev => prev ? prev : e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    haptic();
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const navTo = (path) => { haptic(); navigate(path); };

  useEffect(() => {
      const fetchData = async () => {
          try {
              const userRes = await axios.get(`${API_URL}/api/user/${deviceId}`);
              const today = new Date().toISOString().split('T')[0];
              const log = userRes.data.data.dailyLog.find(l => l.date === today);
              setTodayScore(log ? log.totalPoisonScore : 0);

              const alertRes = await axios.get(`${API_URL}/api/alerts`);
              setAlerts(alertRes.data.data);
          } catch (e) { console.error("Error fetching home data:", e); }
      };
      fetchData();
  }, [API_URL, deviceId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-gray-50 pt-28 safe-bottom"> {/* Increased PT to 28 for TopBar */}
      
      {/* 🎩 PREMIUM TOP NAVBAR (Replaces old scattered buttons) */}
      <TopBar currentLang={currentLang} toggleLang={toggleLang} />

      {/* 🚨 NATIONAL ALERT BANNER (Positioned below TopBar via pt-20 in main div or manually top-20) */}
      {alerts.length > 0 && (
          <div className="fixed top-20 left-0 w-full z-30 p-2 space-y-2 pointer-events-none safe-top flex flex-col items-center">
              {alerts.map(alert => (
                  <div key={alert._id} className={`pointer-events-auto w-full max-w-md flex items-start gap-3 p-3 rounded-xl shadow-xl border-l-4 animate-slide-down backdrop-blur-md mx-2 mt-1 ${alert.level === 'emergency' ? 'bg-red-600/95 text-white border-red-900' : alert.level === 'warning' ? 'bg-yellow-100/95 text-yellow-900 border-yellow-500' : 'bg-blue-100/95 text-blue-900 border-blue-500'}`}>
                      <div className="mt-1 flex-shrink-0">
                          {alert.level === 'emergency' && <AlertTriangle size={20} className="text-white" />}
                          {alert.level === 'warning' && <Bell size={20} />}
                          {alert.level === 'info' && <Info size={20} />}
                      </div>
                      <div>
                          <h4 className="font-bold text-sm uppercase tracking-wide leading-tight">{alert.title}</h4>
                          <p className="text-xs opacity-90 mt-1 leading-snug">{alert.message}</p>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* 📊 DAILY POISON METER (Kept in body as a Dashboard Widget) */}
      <div className="w-full max-w-md bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between mb-8 transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${todayScore > 50 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                <Activity size={24} />
            </div>
            <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{currentLang === 'hi' ? 'दैनिक जहर' : "Today's Poison"}</p>
                <div className="flex items-baseline gap-1">
                    <p className={`text-3xl font-black ${todayScore > 50 ? 'text-red-600' : 'text-gray-800'}`}>{todayScore}</p>
                    <span className="text-gray-300 text-sm font-bold">/100</span>
                </div>
            </div>
          </div>
          {/* Status Label */}
          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${todayScore > 50 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
              {todayScore > 50 ? 'DANGER' : 'SAFE'}
          </div>
      </div>

      {/* HERO SECTION (Text Only now, logo moved to TopBar) */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-gray-800 tracking-tighter">
            {currentLang === 'hi' ? 'नमस्ते' : 'Hello'}, <span className="text-brand-green">User</span>
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
            {currentLang === 'hi' ? 'आज आप क्या खा रहे हैं?' : 'What are you eating today?'}
        </p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="w-full max-w-md space-y-4 px-2 pb-32">
        <button onClick={() => navTo('/scan')} className="w-full bg-black text-white font-bold py-6 px-6 rounded-3xl shadow-2xl flex items-center justify-between group transition-all transform hover:scale-[1.02] active:scale-95">
          <div className="flex items-center gap-4">
              <div className="bg-gray-800 p-3 rounded-2xl group-hover:bg-gray-700 transition-colors">
                <Scan size={28} className="text-brand-green" />
              </div>
              <div className="text-left">
                  <p className="text-lg leading-none">{currentLang === 'hi' ? 'स्कैन शुरू करें' : 'Scan Food'}</p>
                  <p className="text-xs text-gray-400 font-normal mt-1">Check for toxins & allergies</p>
              </div>
          </div>
          <div className="bg-white/10 p-2 rounded-full">
            <Scan size={16} />
          </div>
        </button>

        <button onClick={() => navTo('/library')} className="w-full bg-white hover:bg-gray-50 text-gray-800 font-bold py-5 px-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group transition-all active:scale-95">
          <div className="flex items-center gap-4">
              <div className="bg-purple-50 p-3 rounded-2xl group-hover:bg-purple-100 transition-colors">
                <Search size={24} className="text-purple-600" />
              </div>
              <div className="text-left">
                  <p className="text-lg leading-none">{currentLang === 'hi' ? 'जहर लाइब्रेरी' : 'Poison Library'}</p>
                  <p className="text-xs text-gray-400 font-normal mt-1">Reverse search ingredients</p>
              </div>
          </div>
        </button>
      </div>
      
      {/* PWA INSTALL */}
      {deferredPrompt && (
        <button onClick={handleInstallClick} className="fixed bottom-28 right-5 z-50 bg-black text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce font-bold border border-gray-800 safe-bottom">
          <Download size={20} /> Install App
        </button>
      )}

      <p className="mt-4 text-xs font-bold tracking-widest text-gray-300 uppercase">SafeBite v1.0</p>
    </div>
  );
};

// --- MAIN APP ROUTING ---
function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-sans">
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scan" element={<Scanner />} />
        <Route path="/result" element={<Result />} />
        <Route path="/profile" element={<HealthProfile />} />
        <Route path="/library" element={<PoisonLibrary />} />
        <Route path="/admin" element={<AdminPanel />} />
        </Routes>

        {/* 🧭 PREMIUM BOTTOM NAV */}
        <BottomNav />
    </div>
  );
}

export default App;