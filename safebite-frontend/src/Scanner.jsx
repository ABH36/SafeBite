import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const Scanner = () => {
  const navigate = useNavigate();
  const [scanError, setScanError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL; // ENV Loaded

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(onScanSuccess, onScanFailure);

    async function onScanSuccess(decodedText) {
      // Accept only valid barcode numbers
      if (!/^[0-9]{8,14}$/.test(decodedText)) return;

      scanner.clear(); // Stop camera

      try {
        const response = await axios.get(`${API_URL}/api/product/${decodedText}`);

        navigate('/result', {
          state: {
            product: response.data.data,
            alternatives: response.data.alternatives || [],
            barcode: decodedText
          }
        });

      } catch (error) {
        navigate('/result', { state: { product: null, barcode: decodedText } });
      }
    }

    function onScanFailure() {}

    return () => {
      scanner.clear().catch(err => console.error("Scanner clear error", err));
    };
  }, [navigate, API_URL]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-2xl relative">
        <button onClick={() => navigate('/')} className="absolute -top-12 right-0 text-white p-2">
          <XCircle size={32} />
        </button>
        <h2 className="text-center font-bold text-gray-700 mb-4">Scan Product Barcode</h2>
        <div id="reader" className="overflow-hidden rounded-lg"></div>
        <p className="text-center text-xs text-gray-400 mt-4">
          Point camera at the barcode on the packaging.
        </p>
      </div>
    </div>
  );
};

export default Scanner;
