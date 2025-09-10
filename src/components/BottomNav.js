import React from 'react';
import { icons } from '../assets';

export default function BottomNav({ page, setPage }) {
    const navItems = [
        { name: 'home', icon: icons.home },
        { name: 'community', icon: icons.community },
        { name: 'messages', icon: icons.messages },
        { name: 'profile', icon: icons.profile },
    ];
    return (
        <nav className="bg-[#1e293b] p-2 flex justify-around fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-20">
            {navItems.map(item => (
                <button
                    key={item.name}
                    onClick={() => setPage(item.name)}
                    className={`p-3 rounded-full transition-colors ${page === item.name ? 'bg-yellow-400' : 'hover:bg-slate-600'}`}
                >
                    <img src={item.icon} alt={item.name} className={`w-8 h-8 ${page === item.name ? 'filter invert' : ''}`} />
                </button>
            ))}
        </nav>
    );
}
