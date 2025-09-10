import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';
import { icons } from '../assets';

export default function NotificationsScreen({ currentUserProfile, setProfile }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequestProfiles = useCallback(async () => {
        if (currentUserProfile.connectionRequests && currentUserProfile.connectionRequests.length > 0) {
            const profilePromises = currentUserProfile.connectionRequests.map(uid => getDoc(doc(db, 'users', uid)));
            const profileSnapshots = await Promise.all(profilePromises);
            const requestProfiles = profileSnapshots.map(snap => snap.exists() ? { id: snap.id, ...snap.data() } : null).filter(Boolean);
            setRequests(requestProfiles);
        } else {
            setRequests([]);
        }
        setLoading(false);
    }, [currentUserProfile.connectionRequests]);
    
    useEffect(() => {
        fetchRequestProfiles();
    }, [fetchRequestProfiles]);

    const handleRequest = async (targetId, accept) => {
        const currentUserRef = doc(db, 'users', currentUserProfile.uid);
        const targetUserRef = doc(db, 'users', targetId);
        
        await updateDoc(currentUserRef, { connectionRequests: arrayRemove(targetId) });

        if (accept) {
            await updateDoc(currentUserRef, { connections: arrayUnion(targetId) });
            await updateDoc(targetUserRef, { connections: arrayUnion(currentUserProfile.uid) });
        }
        
        const updatedProfileSnap = await getDoc(currentUserRef);
        setProfile(updatedProfileSnap.data());
    };

    if (loading) return <p className="text-center text-slate-400">Loading notifications...</p>;
    
    if (requests.length === 0) {
        return <p className="text-center text-slate-400 mt-10">No new notifications</p>
    }

    return (
        <div className="space-y-3">
            {requests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-3 bg-[#1e293b] rounded-lg">
                    <div className="flex items-center">
                         <img src={req.photoURL} alt={req.name} className="w-10 h-10 rounded-full mr-3"/>
                        <span className="font-semibold">{req.name}</span>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => handleRequest(req.id, true)} className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center hover:bg-green-400 transition-colors">
                            <img src={icons.check} alt="accept" className="w-6 h-6"/>
                        </button>
                        <button onClick={() => handleRequest(req.id, false)} className="bg-red-500 w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors">
                            <img src={icons.close} alt="decline" className="w-6 h-6"/>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
