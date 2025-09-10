import React from 'react';

export default function LoadingScreen() {
    return (
        <div className="flex items-center justify-center h-screen bg-[#0f172a]">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4 animate-pulse">GigXperts</h1>
                <p className="text-indigo-300">Loading your expert network...</p>
            </div>
        </div>
    );
}