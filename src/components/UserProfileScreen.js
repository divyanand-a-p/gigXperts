import React from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { icons } from '../assets';

export default function UserProfileScreen({ profileData, currentUserProfile, setView, setViewData, setToast }) {
    const isCurrentUser = profileData.uid === auth.currentUser.uid;
    const isAlreadyConnected = currentUserProfile.connections.includes(profileData.uid);
    const hasSentRequest = profileData.connectionRequests.includes(currentUserProfile.uid);

    const handleConnect = async () => {
        if (isCurrentUser || isAlreadyConnected || hasSentRequest) return;
        const targetUserRef = doc(db, 'users', profileData.uid);
        await updateDoc(targetUserRef, {
            connectionRequests: arrayUnion(currentUserProfile.uid)
        });
        setToast(`Connection request sent to ${profileData.name}`);
    };
    
    const handleMessage = () => {
        setViewData(profileData);
        setView('chat');
    };

    return (
        <div className="p-4 bg-[#1e293b] rounded-lg">
            <div className="text-center mb-4">
                <img src={profileData.photoURL} alt={profileData.name} className="w-24 h-24 rounded-full mx-auto mb-2"/>
                <h2 className="text-2xl font-bold">{profileData.name}</h2>
                <p className="flex items-center justify-center font-bold text-yellow-400">
                    <img src={icons.star} alt="star" className="w-5 h-5 mr-1 filter invert brightness-0 sepia saturate-10000 hue-rotate-3deg"/>
                    {profileData.rating || '4.5'}
                </p>
                <p className="text-sm text-slate-400">{profileData.connections.length} connections</p>
            </div>
            
            <div className="space-y-4 text-sm">
                <div>
                    <h3 className="font-bold text-base mb-1 border-b border-slate-700 pb-1">Description</h3>
                    <p className="break-words">{profileData.description || 'No description provided.'}</p>
                </div>
                 <div>
                    <h3 className="font-bold text-base mb-2 border-b border-slate-700 pb-1">Skillset</h3>
                    <div className="flex flex-wrap gap-2">
                        {profileData.skillset.map(skill => (
                            <span key={skill} className="bg-indigo-600 px-3 py-1 text-sm rounded-full">{skill}</span>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="font-bold text-base mb-1 border-b border-slate-700 pb-1">Contact & Links</h3>
                    <p className="break-words"><strong>LinkedIn:</strong> {profileData.linkedin || 'N/A'}</p>
                    <p className="break-words"><strong>GitHub:</strong> {profileData.github || 'N/A'}</p>
                </div>
            </div>

            {!isCurrentUser && (
                 <div className="flex space-x-2 mt-6">
                    <button onClick={handleConnect} disabled={isAlreadyConnected || hasSentRequest} className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {isAlreadyConnected ? 'Connected' : hasSentRequest ? 'Request Sent' : 'Connect'}
                    </button>
                    <button onClick={handleMessage} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-500 transition-colors">Message</button>
                 </div>
            )}
        </div>
    );
}