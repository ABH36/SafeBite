import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, AlertTriangle, ArrowLeft, Baby, ChevronDown, ChevronUp, Info, Leaf, ArrowRight, Flag, X, CheckCircle, Plus, Check } from 'lucide-react';
import { getRiskIcon } from './utils/iconMap';
import { getDeviceId } from './utils/device';
// 👇 NEW IMPORTS FOR HINDI
import { getLanguage } from './utils/lang';
import { translations, translateRisk } from './utils/translations';

const Result = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const deviceId = getDeviceId();

    // 🇮🇳 LANGUAGE SETUP
    const lang = getLanguage(); 
    const t = translations[lang]; // Get English or Hindi dictionary

    const [expandedId, setExpandedId] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportIssue, setReportIssue] = useState('Wrong Ingredients');
    const [reportDesc, setReportDesc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);
    const [logAdded, setLogAdded] = useState(false);

    const { product, alternatives, barcode } = location.state || {};

    // Handle No Data
    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">{lang === 'hi' ? 'कोई डेटा नहीं मिला' : 'No Data Found'}</h2>
                <button onClick={() => navigate('/')} className="mt-8 w-full bg-gray-900 text-white py-4 rounded-xl font-bold">
                    {lang === 'hi' ? 'फिर से स्कैन करें' : 'Scan Another Product'}
                </button>
            </div>
        );
    }

    const { name, brand, analysis } = product;
    const { status, harmfulIngredients, isChildSafe } = analysis;

    // Theme Logic with Translated Labels
    const theme = {
        RED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: ShieldAlert, label: t.dangerous },
        YELLOW: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: AlertTriangle, label: t.moderateRisk },
        GREEN: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: ShieldCheck, label: t.safeToEat }
    }[status] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: Info, label: t.unknown };

    const StatusIcon = theme.icon;

    const handleLog = async () => {
        try {
            await axios.post(`${API_URL}/api/user/log`, { deviceId, barcode: product.barcode });
            setLogAdded(true);
        } catch (error) { alert("Failed to log."); }
    };

    return (
        <div className="min-h-screen bg-white pb-24 relative">
            
            {/* --- HEADER --- */}
            <div className={`relative ${theme.bg} pb-10 rounded-b-[3rem] shadow-sm border-b ${theme.border}`}>
                <div className="p-4 flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="bg-white p-2 rounded-full shadow-sm hover:bg-gray-50">
                        <ArrowLeft size={24} className="text-gray-700" />
                    </button>
                    <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">{t.analysisReport}</span>
                    <button onClick={() => setShowReportModal(true)} className="bg-white p-2 rounded-full shadow-sm hover:bg-red-50 text-gray-400 hover:text-red-500">
                        <Flag size={20} />
                    </button>
                </div>

                <div className="flex flex-col items-center mt-2 px-6 text-center">
                    <div className="bg-white p-4 rounded-full shadow-md mb-4 ring-4 ring-white/50">
                        <StatusIcon size={64} className={theme.text} />
                    </div>
                    <h1 className={`text-3xl font-black ${theme.text} tracking-tight`}>{theme.label}</h1>
                    <p className="text-gray-600 font-medium text-lg mt-2 leading-snug">{name}</p>
                    <p className="text-gray-400 text-sm mt-1 mb-4">{brand}</p>

                    <button 
                        onClick={handleLog}
                        disabled={logAdded}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold shadow-sm transition-all ${
                            logAdded ? 'bg-green-100 text-green-700' : 'bg-black text-white hover:bg-gray-800'
                        }`}
                    >
                        {logAdded ? <Check size={18} /> : <Plus size={18} />}
                        {logAdded ? t.addedLog : t.iAteThis}
                    </button>
                </div>

                {!isChildSafe && (
                    <div className="mx-6 mt-6 bg-red-100 border border-red-200 text-red-800 text-sm p-3 rounded-xl text-center font-bold flex items-center justify-center gap-2 shadow-sm">
                        <Baby size={20} />
                        {t.childWarning}
                    </div>
                )}
            </div>

            {/* --- CONTENT --- */}
            <div className="px-5 -mt-8 relative z-10 space-y-6 max-w-md mx-auto">
                
                {/* UGLY TRUTH */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 text-xl">{t.uglyTruth}</h3>
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
                            {harmfulIngredients.length} {t.toxins}
                        </span>
                    </div>

                    {harmfulIngredients.length > 0 ? (
                        <div className="space-y-3">
                            {harmfulIngredients.map((ing, index) => (
                                <div key={index} 
                                    onClick={() => setExpandedId(expandedId === index ? null : index)}
                                    className={`border rounded-xl transition-all ${expandedId === index ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-100'}`}
                                >
                                    <div className="p-4 flex items-center gap-3 cursor-pointer">
                                        <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100">
                                            {getRiskIcon(ing.riskCategory)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 capitalize">{ing.name}</h4>
                                            {/* 🇮🇳 TRANSLATE RISK CATEGORY */}
                                            <p className={`text-xs font-semibold ${theme.text}`}>
                                                {translateRisk(ing.riskCategory, lang)}
                                            </p>
                                        </div>
                                        {expandedId === index ? <ChevronUp size={18} className="text-gray-400"/> : <ChevronDown size={18} className="text-gray-400"/>}
                                    </div>

                                    {expandedId === index && (
                                        <div className="px-4 pb-4 pt-0 text-sm text-gray-600 border-t border-gray-200 mt-2 pt-3">
                                            <p className="leading-relaxed">
                                                <span className="font-bold text-gray-800">{t.whyBad}</span> {ing.description}
                                            </p>
                                            <p className="mt-3 text-xs text-gray-500 bg-white p-2 rounded border border-dashed border-gray-300 italic">
                                                {t.freqCons}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-green-50 rounded-xl border border-green-100 border-dashed">
                            <ShieldCheck className="mx-auto text-green-500 mb-2" size={32} />
                            <p className="text-green-700 font-bold">Clean Label!</p>
                        </div>
                    )}
                </div>

                {/* ALTERNATIVES */}
                {alternatives && alternatives.length > 0 && status !== 'GREEN' && (
                    <div className="animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <Leaf className="text-green-600" size={20} />
                            <h3 className="font-bold text-gray-800 text-lg">{t.saferOptions}</h3>
                        </div>

                        <div className="space-y-3">
                            {alternatives.map((alt, index) => (
                                <div key={index} className="bg-white rounded-xl p-4 shadow-md border border-green-100 flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                        <img src={alt.image || "https://placehold.co/100x100?text=No+Img"} alt={alt.name} className="w-full h-full object-cover"/>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-sm leading-tight">{alt.name}</h4>
                                        <p className="text-gray-500 text-xs mt-1">{alt.brand}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <ShieldCheck size={10} /> {t.safeChoice}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="bg-green-50 text-green-600 p-2 rounded-full">
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-4 text-center border-t border-gray-100 pt-2">
                            {t.legalAlt}
                        </p>
                    </div>
                )}
                
                <p className="text-center text-[10px] text-gray-400 pb-8 px-4 leading-relaxed mt-4">
                    {t.legalFooter}
                </p>
            </div>
            
            {/* Report Modal Code (Keep as is, or can be translated similarly) */}
            {/* ... */}
        </div>
    );
};

export default Result;