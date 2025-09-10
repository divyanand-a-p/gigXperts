import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function CreateTeamRequestScreen({setView, currentUserProfile, setToast}) {
    const [formData, setFormData] = useState({ eventName: '', skillNeeded: '', membersNeeded: 2, description: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!formData.eventName || !formData.skillNeeded || !formData.description) {
            setToast("Please fill all fields");
            return;
        }
        await addDoc(collection(db, 'teamRequests'), {
            ...formData,
            creatorId: currentUserProfile.uid,
            creatorName: currentUserProfile.name,
            membersFilled: 1,
            createdAt: serverTimestamp()
        });
        setToast("Team request posted!");
        setView(null);
    }
    
    return (
        <form onSubmit={handleSubmit} className="p-4 bg-[#1e293b] rounded-lg space-y-4">
             <h2 className="text-xl font-bold text-center text-yellow-400">Create Team Request</h2>
             <div>
                <label className="text-xs text-slate-400">Event Name (e.g., Hackathon)</label>
                <input type="text" value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} className="w-full bg-slate-700 p-2 rounded mt-1"/>
             </div>
              <div>
                <label className="text-xs text-slate-400">Skill Needed</label>
                <input type="text" value={formData.skillNeeded} onChange={e => setFormData({...formData, skillNeeded: e.target.value})} className="w-full bg-slate-700 p-2 rounded mt-1"/>
             </div>
             <div>
                <label className="text-xs text-slate-400">Total Team Members Needed</label>
                <input type="number" min="2" max="10" value={formData.membersNeeded} onChange={e => setFormData({...formData, membersNeeded: Number(e.target.value)})} className="w-full bg-slate-700 p-2 rounded mt-1"/>
             </div>
             <div>
                <label className="text-xs text-slate-400">Short Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-700 p-2 rounded mt-1 h-20"/>
             </div>
             <button type="submit" className="w-full bg-yellow-400 text-black font-bold py-2 rounded-lg">Post Request</button>
        </form>
    );
}