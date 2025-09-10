import React from 'react';

export default function Toast({ message }) {
    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-2 rounded-full shadow-lg z-50 animate-fade-in-out">
            {message}
        </div>
    );
}
