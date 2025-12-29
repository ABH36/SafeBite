import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, UserCircle, Languages, Menu } from 'lucide-react';

const TopBar = ({ currentLang, toggleLang }) => {
    const navigate = useNavigate();

    return (
        <div className="fixed top-0 left-0 right-0 z-40 flex justify-center px-4 pt-4 pointer-events-none">
            {/* THE BAR CONTAINER */}
            <div className="pointer-events-auto w-full max-w-md bg-white/80 backdrop-blur-md border border-white/40 shadow-sm rounded-2xl flex items-center justify-between p-3 transition-all duration-300 hover:shadow-md hover:bg-white/90">
                
                {/* LEFT: LOGO & BRAND */}
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
                    <div className="bg-gradient-to-tr from-brand-green to-emerald-400 p-2 rounded-xl shadow-lg shadow-green-200 transform transition-transform duration-700 group-hover:rotate-[360deg]">
                        <ShieldAlert size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-gray-800 tracking-tight leading-none">SafeBite</h1>
                        <p className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">Premium</p>
                    </div>
                </div>

                {/* RIGHT: CONTROLS */}
                <div className="flex items-center gap-2">
                    
                    {/* Language Toggle */}
                    <button 
                        onClick={toggleLang}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-xl transition-all active:scale-95 flex items-center gap-1"
                    >
                        <Languages size={18} />
                        <span className="text-xs font-bold hidden sm:inline">{currentLang === 'en' ? 'EN' : 'HI'}</span>
                    </button>

                    {/* Profile Button */}
                    <button 
                        onClick={() => navigate('/profile')}
                        className="bg-black hover:bg-gray-800 text-white p-2 rounded-xl shadow-lg shadow-gray-300 transition-all active:scale-95 hover:-translate-y-0.5"
                    >
                        <UserCircle size={20} />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default TopBar;