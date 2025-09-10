import React from 'react';
import { auth, provider } from '../firebase/config';
import { signInWithPopup } from 'firebase/auth';
import { icons } from '../assets';

export default function LoginScreen() {
    
    const handleSignIn = async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in: ", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#0f172a] p-8 text-center">
            <h1 className="text-5xl font-bold text-white mb-4">GigXperts</h1>
            <p className="text-indigo-300 mb-12">Your College's Exclusive Freelance Network.</p>
            <button
                onClick={handleSignIn}
                className="w-full max-w-xs bg-white text-gray-800 font-semibold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center transition-transform transform hover:scale-105"
            >
                <img src={icons.google} alt="Google Logo" className="w-6 h-6 mr-4" />
                Sign In Using Google
            </button>
        </div>
    );
}
