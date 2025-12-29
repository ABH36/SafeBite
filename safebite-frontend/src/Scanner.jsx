import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Baby } from 'lucide-react'; // 👈 Import Baby Icon
import { getDeviceId } from './utils/device';

const Scanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [isChildMode, setIsChildMode] = useState(false); // 👶 New State
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const deviceId = getDeviceId();

    // 1. Check Profile on Load
    useEffect(() => {
        const checkProfile = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/user/${deviceId}`);
                const age = res.data.data?.healthProfile?.age;
                if (age && age < 12) {
                    setIsChildMode(true); // 🛡️ Activate Child Mode Visuals
                }
            } catch (e) { console.error(e); }
        };
        checkProfile();
    }, [API_URL, deviceId]);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            },
            false
        );

        async function onScanSuccess(decodedText) {
            if (scanResult) return;
            setScanResult(decodedText);
            if (!/^[0-9]{8,14}$/.test(decodedText)) return; 

            scanner.clear();
            
            try {
                console.log("Fetching...", decodedText);
                const response = await axios.get(`${API_URL}/api/product/${decodedText}`, {
                    headers: { 'x-device-id': deviceId }
                });
                
                navigate('/result', { state: { product: response.data.data, alternatives: response.data.alternatives, barcode: decodedText } });

            } catch (error) {
                console.error("Error", error);
                navigate('/result', { state: { product: null, barcode: decodedText } });
            }
        }

        function onScanError(errorMessage) { }

        scanner.render(onScanSuccess, onScanError);

        return () => {
            scanner.clear().catch(error => console.error("Scanner clear error", error));
        };
    }, [scanResult, navigate, API_URL, deviceId]);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <button onClick={() => navigate('/')} className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors">
                    <ArrowLeft size={24} className="text-white" />
                </button>
                
                {/* 👶 CHILD MODE BADGE */}
                {isChildMode ? (
                    <div className="flex items-center gap-2 bg-blue-600 px-3 py-1 rounded-full animate-pulse">
                        <Baby size={16} className="text-white" />
                        <span className="font-bold text-xs">CHILD GUARD ON</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Zap size={20} className="text-yellow-400 fill-current" />
                        <span className="font-bold tracking-wider text-sm">LIVE SCAN</span>
                    </div>
                )}
                
                <div className="w-10"></div>
            </div>

            {/* Scanner Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative">
                <div id="reader" className={`w-full max-w-sm overflow-hidden rounded-3xl border-4 shadow-2xl ${isChildMode ? 'border-blue-500' : 'border-gray-700'}`}></div>
                
                <p className="mt-8 text-gray-400 text-sm font-medium text-center px-6">
                    {isChildMode 
                        ? "Scanning in strict mode for children 🛡️" 
                        : "Point camera at a barcode on any food packet"}
                </p>
            </div>
        </div>
    );
};

export default Scanner;