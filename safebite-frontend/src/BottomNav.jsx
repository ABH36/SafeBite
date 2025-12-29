import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Scan, Search, User, Grid } from 'lucide-react'; // Grid for Admin optional

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Haptic Feedback
    const navTo = (path) => {
        if (navigator.vibrate) navigator.vibrate(10); // Light tap
        navigate(path);
    };

    const isActive = (path) => location.pathname === path;

    // Hide on Admin Panel
    if (location.pathname === '/admin') return null;

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/library', icon: Search, label: 'Library' },
        // Middle button is handled separately
        { path: '/profile', icon: User, label: 'Profile' },
        // Optional Admin shortcut or Menu
        // { path: '/admin', icon: Grid, label: 'Menu' },
    ];

    return (
        <div className="fixed bottom-6 left-4 right-4 z-50 flex justify-center safe-bottom pointer-events-none">
            {/* THE DOCK CONTAINER 
               - Glassmorphism (backdrop-blur)
               - Floating shadow
               - Rounded corners
            */}
            <div className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl px-6 py-3 flex items-center justify-between w-full max-w-md relative transition-all duration-300 hover:scale-[1.02]">
                
                {/* LEFT ITEMS */}
                {navItems.slice(0, 2).map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navTo(item.path)}
                        className="relative flex flex-col items-center justify-center w-12 h-12 group"
                    >
                        {/* Active Indicator Dot */}
                        <span className={`absolute -top-1 w-1 h-1 rounded-full bg-brand-green transition-all duration-300 ${isActive(item.path) ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span>
                        
                        {/* Icon with Bounce Animation */}
                        <div className={`transition-all duration-300 ${isActive(item.path) ? 'text-black -translate-y-1 scale-110' : 'text-gray-400 group-hover:text-gray-600'}`}>
                            <item.icon size={24} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                        </div>
                    </button>
                ))}

                {/* 📸 CENTER SCAN BUTTON (FLOATING OUT) */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-6">
                    <button
                        onClick={() => navTo('/scan')}
                        className="relative group w-16 h-16 rounded-full bg-black flex items-center justify-center shadow-2xl border-4 border-gray-50 transform transition-all duration-300 active:scale-90 hover:shadow-brand-green/50"
                    >
                        {/* Pulse Effect Ring */}
                        <span className="absolute w-full h-full rounded-full bg-brand-green/30 animate-ping opacity-75 group-hover:opacity-100"></span>
                        
                        <Scan size={28} className="text-white relative z-10 transition-transform duration-500 group-hover:rotate-90" />
                    </button>
                </div>

                {/* RIGHT ITEMS */}
                {navItems.slice(2, 4).map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navTo(item.path)}
                        className="relative flex flex-col items-center justify-center w-12 h-12 group"
                    >
                        <span className={`absolute -top-1 w-1 h-1 rounded-full bg-brand-green transition-all duration-300 ${isActive(item.path) ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span>
                        
                        <div className={`transition-all duration-300 ${isActive(item.path) ? 'text-black -translate-y-1 scale-110' : 'text-gray-400 group-hover:text-gray-600'}`}>
                            <item.icon size={24} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                        </div>
                    </button>
                ))}

            </div>
        </div>
    );
};

export default BottomNav;