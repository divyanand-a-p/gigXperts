import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { icons } from '../assets';

export default function CommunityScreen({ setView, setViewData }) {
    const [teamRequests, setTeamRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'teamRequests'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const requests = [];
            querySnapshot.forEach((doc) => {
                requests.push({ id: doc.id, ...doc.data() });
            });
            setTeamRequests(requests);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleChatRequest = async (request) => {
        const userDoc = await getDoc(doc(db, 'users', request.creatorId));
        if (userDoc.exists()) {
            setViewData(userDoc.data());
            setView('chat');
        }
    }

    if (loading) return <p className="text-center text-slate-400">Loading team requests...</p>;

    return (
        <div className="relative h-full min-h-[calc(100vh-200px)]">
            {teamRequests.length === 0 ? (
                 <p className="text-center text-slate-400 mt-10">No team requests yet. Be the first!</p>
            ) : (
                <div className="space-y-4">
                    {teamRequests.map(req => (
                        <div key={req.id} className="bg-[#1e293b] p-4 rounded-lg shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-yellow-400">{req.eventName}</h3>
                                    <p className="text-sm text-slate-300">LOOKING FOR: <span className="font-semibold">{req.skillNeeded}</span></p>
                                </div>
                                <div className="text-right flex items-center space-x-4">
                                     <p className="font-mono bg-slate-700 px-2 py-1 rounded">{req.membersFilled}/{req.membersNeeded}</p>
                                     <button onClick={() => handleChatRequest(req)} className="bg-slate-700 rounded-full p-2 hover:bg-slate-600">
                                        <img src={icons.info} alt="info" className="w-6 h-6"/>
                                     </button>
                                </div>
                            </div>
                            <p className="text-sm mt-2 pt-2 border-t border-slate-700">{req.description}</p>
                        </div>
                    ))}
                </div>
            )}
            <button onClick={() => setView('createTeamRequest')} className="absolute bottom-0 right-0 bg-yellow-400 text-black w-14 h-14 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                <img src={icons.plus} alt="add request" className="w-8 h-8 filter invert"/>
            </button>
        </div>
    );
}