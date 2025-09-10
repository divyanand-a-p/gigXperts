import React, { useState } from 'react';

export default function PaymentScreen({ setToast }) {
    const [amount, setAmount] = useState('');

    const handleKeyPress = (key) => {
        if (key === 'del') {
            setAmount(amount.slice(0, -1));
        } else if (amount.length < 6) {
            setAmount(amount + key);
        }
    };
    
    const handlePayment = () => {
        if (parseInt(amount) > 0) {
            setToast(`Redirecting to Razorpay for ₹${amount}...`);
            setTimeout(() => {
                 window.open('https://razorpay.com/', '_blank');
            }, 1500);
        } else {
            setToast('Please enter a valid amount');
        }
    };

    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0'];

    return (
         <div className="p-4 bg-[#1e293b] rounded-lg flex flex-col items-center">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">Enter Amount</h2>
            <div className="w-full text-center bg-slate-800 p-4 rounded-lg text-4xl font-mono mb-6 h-20 flex items-center justify-center">
                <span className="text-slate-400 mr-2">₹</span>{amount || '0'}
            </div>
            <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
                {keys.map(key => (
                     <button key={key} onClick={() => handleKeyPress(key)} className="bg-slate-700 text-2xl h-16 rounded-lg flex items-center justify-center hover:bg-slate-600 transition-colors">
                        {key === 'del' ? '⌫' : key}
                     </button>
                ))}
                <button onClick={handlePayment} className="col-span-3 bg-yellow-400 text-black font-bold h-16 rounded-lg text-2xl">→</button>
            </div>
         </div>
    );
}
