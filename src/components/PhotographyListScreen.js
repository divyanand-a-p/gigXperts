import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { icons } from '../assets';

export default function PhotographyListScreen({ setView, setViewData }) {
    const [photographers, setPhotographers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPhotographers = async () => {
            const q = query(collection(db, 'users'), where('skillset', 'array-contains', 'PHOTOGRAPHY'));
            const querySnapshot = await getDocs(q);
            const photographersList = querySnapshot.docs
                .map(doc => doc.exists() ? {
                    id: doc.id,
                    ...doc.data(),
                    rating: (Math.random() * (5 - 3.8) + 3.8).toFixed(1)
                } : null)
                .filter(Boolean); // Remove any null entries
            setPhotographers(photographersList);
            setLoading(false);
        };
        fetchPhotographers();
    }, []);

    const handleUserClick = (photographer) => {
        setViewData(photographer);
        setView('userProfile');
    };
    
    if (loading) return <p className="text-center text-slate-400">Finding photographers...</p>;

    if (photographers.length === 0) {
        return <p className="text-center text-slate-400 mt-10">No photographers have added this skill yet.</p>;
    }

    return (
        <div>
            <div className="space-y-3">
                {photographers.map(p => {
                    // Safety Check: Ensure photographer object is valid
                    if (!p || !p.id) return null;

                    return (
                        <div key={p.id} onClick={() => handleUserClick(p)} className="flex items-center justify-between p-3 bg-[#1e293b] rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                            <div className="flex items-center">
                                <img src={p.photoURL} alt={p.name} className="w-10 h-10 rounded-full mr-3"/>
                                <span className="font-semibold">{p.name || "Unnamed Photographer"}</span>
                            </div>
                            <span className="flex items-center font-bold text-yellow-400">
                               <img src={icons.star} alt="star" className="w-5 h-5 mr-1 filter invert brightness-0 sepia saturate-10000 hue-rotate-3deg"/>
                               {p.rating}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
