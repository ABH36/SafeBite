import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, AlertTriangle, ArrowLeft, Baby, ChevronDown, ChevronUp, Info, Leaf, ArrowRight, Flag, X, CheckCircle } from 'lucide-react';
import { getRiskIcon } from './utils/iconMap';

const Result = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const [expandedId, setExpandedId] = useState(null);
    
    // --- REPORT SYSTEM STATES ---
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportIssue, setReportIssue] = useState('Wrong Ingredients');
    const [reportDesc, setReportDesc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);

    // 1. Get Product & Alternatives from Router State
    const { product, alternatives, barcode } = location.state || {};

    // Handle "Product Not Found"
    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                    <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">No Data Found</h2>
                    <p className="text-gray-500 mt-2">
                        We don't have analysis for barcode: <br/>
                        <span className="font-mono font-bold text-gray-700 bg-gray-200 px-2 py-1 rounded mt-1 inline-block">{barcode}</span>
                    </p>
                    <button onClick={() => navigate('/')} className="mt-8 w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg">
                        Scan Another Product
                    </button>
                </div>
            </div>
        );
    }

    const { name, brand, analysis } = product;
    const { status, harmfulIngredients, isChildSafe } = analysis;

    // Theme Logic
    const theme = {
        RED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: ShieldAlert, label: 'DANGEROUS' },
        YELLOW: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: AlertTriangle, label: 'MODERATE RISK' },
        GREEN: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: ShieldCheck, label: 'SAFE TO EAT' }
    }[status] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: Info, label: 'UNKNOWN' };

    const StatusIcon = theme.icon;

    // --- SUBMIT REPORT FUNCTION ---
    const handleReportSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axios.post(`${API_URL}/api/report`, {
                barcode: product.barcode,
                productName: name,
                issueType: reportIssue,
                description: reportDesc
            });
            setReportSuccess(true);
            setTimeout(() => {
                setShowReportModal(false);
                setReportSuccess(false);
                setReportDesc('');
            }, 2000);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to submit report");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pb-24 relative">
            
            {/* --- 1. HEADER SECTION --- */}
            <div className={`relative ${theme.bg} pb-10 rounded-b-[3rem] shadow-sm border-b ${theme.border}`}>
                <div className="p-4 flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="bg-white p-2 rounded-full shadow-sm hover:bg-gray-50">
                        <ArrowLeft size={24} className="text-gray-700" />
                    </button>
                    <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Analysis Report</span>
                    
                    {/* 🚩 REPORT BUTTON */}
                    <button onClick={() => setShowReportModal(true)} className="bg-white p-2 rounded-full shadow-sm hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Flag size={20} />
                    </button>
                </div>

                <div className="flex flex-col items-center mt-2 px-6 text-center">
                    <div className="bg-white p-4 rounded-full shadow-md mb-4 ring-4 ring-white/50">
                        <StatusIcon size={64} className={theme.text} />
                    </div>
                    <h1 className={`text-3xl font-black ${theme.text} tracking-tight`}>{theme.label}</h1>
                    <p className="text-gray-600 font-medium text-lg mt-2 leading-snug">{name}</p>
                    <p className="text-gray-400 text-sm mt-1">{brand}</p>
                </div>

                {!isChildSafe && (
                    <div className="mx-6 mt-6 bg-red-100 border border-red-200 text-red-800 text-sm p-3 rounded-xl text-center font-bold flex items-center justify-center gap-2 shadow-sm">
                        <Baby size={20} />
                        ⚠️ Not recommended for children below 12
                    </div>
                )}
            </div>

            {/* --- 2. CONTENT SECTION --- */}
            <div className="px-5 -mt-8 relative z-10 space-y-6 max-w-md mx-auto">
                
                {/* The Ugly Truth */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 text-xl">The Ugly Truth</h3>
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
                            {harmfulIngredients.length} Toxins
                        </span>
                    </div>

                    {harmfulIngredients.length > 0 ? (
                        <div className="space-y-3">
                            {harmfulIngredients.map((ing, index) => (
                                <div 
                                    key={index} 
                                    onClick={() => setExpandedId(expandedId === index ? null : index)}
                                    className={`border rounded-xl transition-all duration-200 overflow-hidden ${expandedId === index ? 'bg-gray-50 border-gray-300 shadow-inner' : 'bg-white border-gray-100 hover:border-gray-300'}`}
                                >
                                    <div className="p-4 flex items-center gap-3 cursor-pointer">
                                        <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100">
                                            {getRiskIcon(ing.riskCategory)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 capitalize">{ing.name}</h4>
                                            <p className={`text-xs font-semibold ${theme.text}`}>{ing.riskCategory}</p>
                                        </div>
                                        {expandedId === index ? <ChevronUp size={18} className="text-gray-400"/> : <ChevronDown size={18} className="text-gray-400"/>}
                                    </div>

                                    {expandedId === index && (
                                        <div className="px-4 pb-4 pt-0 text-sm text-gray-600 border-t border-gray-200 mt-2 pt-3">
                                            <p className="leading-relaxed">
                                                <span className="font-bold text-gray-800">Why it's bad:</span> {ing.description}
                                            </p>
                                            <p className="mt-3 text-xs text-gray-500 bg-white p-2 rounded border border-dashed border-gray-300 italic">
                                                💡 "Frequent consumption may increase long-term health risk."
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
                            <p className="text-green-600 text-sm">No common toxic ingredients detected.</p>
                        </div>
                    )}
                </div>

                {/* Alternatives */}
                {alternatives && alternatives.length > 0 && status !== 'GREEN' && (
                    <div className="animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <Leaf className="text-green-600" size={20} />
                            <h3 className="font-bold text-gray-800 text-lg">Switch to Safer Options</h3>
                        </div>

                        <div className="space-y-3">
                            {alternatives.map((alt, index) => (
                                <div key={index} className="bg-white rounded-xl p-4 shadow-md border border-green-100 flex items-center gap-4 hover:shadow-lg transition-shadow">
                                    <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                        <img src={alt.image || "https://placehold.co/100x100?text=No+Img"} alt={alt.name} className="w-full h-full object-cover"/>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-sm leading-tight">{alt.name}</h4>
                                        <p className="text-gray-500 text-xs mt-1">{alt.brand}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <ShieldCheck size={10} /> Safe Choice
                                            </span>
                                        </div>
                                    </div>
                                    <button className="bg-green-50 text-green-600 p-2 rounded-full hover:bg-green-100">
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-4 text-center border-t border-gray-100 pt-2">
                            *Alternatives are suggestions, not endorsements. Verify ingredients before consumption.
                        </p>
                    </div>
                )}
                
                <p className="text-center text-[10px] text-gray-400 pb-8 px-4 leading-relaxed mt-4">
                    *SafeBite analysis is based on scientific data but does not replace medical advice. Always consult a doctor.
                </p>
            </div>

            {/* --- REPORT MODAL (OVERLAY) --- */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                        
                        {/* Modal Header */}
                        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Report an Issue</h3>
                            <button onClick={() => setShowReportModal(false)} className="bg-gray-200 p-1 rounded-full hover:bg-gray-300">
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5">
                            {!reportSuccess ? (
                                <form onSubmit={handleReportSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Issue Type</label>
                                        <select 
                                            value={reportIssue}
                                            onChange={(e) => setReportIssue(e.target.value)}
                                            className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                                        >
                                            <option value="Wrong Ingredients">Wrong Ingredients</option>
                                            <option value="Incorrect Risk Score">Incorrect Risk Score</option>
                                            <option value="Barcode Error">Barcode Error</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description (Optional)</label>
                                        <textarea 
                                            value={reportDesc}
                                            onChange={(e) => setReportDesc(e.target.value)}
                                            placeholder="Tell us what's wrong..."
                                            className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[100px]"
                                            maxLength={300}
                                        ></textarea>
                                        <div className="text-right text-[10px] text-gray-400 mt-1">{reportDesc.length}/300</div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 flex justify-center"
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit Report"}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="bg-green-100 text-green-600 p-3 rounded-full inline-block mb-3">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h4 className="font-bold text-gray-800 text-lg">Report Sent!</h4>
                                    <p className="text-sm text-gray-500 mt-1">Thank you for helping us improve SafeBite.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default Result;