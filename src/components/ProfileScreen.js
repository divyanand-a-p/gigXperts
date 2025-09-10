import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { icons } from '../assets';

export default function ProfileScreen({ profile, onSignOut, setProfile, setToast }) {
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ ...profile });

    const handleSave = async () => {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const dataToUpdate = {
            mobile: formData.mobile,
            linkedin: formData.linkedin,
            github: formData.github,
            instagram: formData.instagram,
            description: formData.description,
        };
        await updateDoc(userDocRef, dataToUpdate);
        setProfile({ ...profile, ...dataToUpdate });
        setEditing(false);
        setToast("Profile updated successfully!");
    };
    
    return (
        <div className="p-4 bg-[#1e293b] rounded-lg">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                    <img src={profile.photoURL} alt={profile.name} className="w-16 h-16 rounded-full mr-4" />
                    <div>
                        <h2 className="text-2xl font-bold">{profile.name}</h2>
                        <p className="text-sm text-slate-400">{profile.connections.length} connections</p>
                    </div>
                </div>
                <button onClick={() => setEditing(!editing)}>
                    <img src={editing ? icons.close : icons.edit} alt="edit" className="w-6 h-6"/>
                </button>
            </div>

            <div className="space-y-4">
                {['mobile', 'linkedin', 'github', 'instagram'].map(field => (
                    <div key={field}>
                        <label className="text-xs text-yellow-400 capitalize">{field}</label>
                        {editing ? 
                            <input type="text" value={formData[field]} onChange={(e) => setFormData({...formData, [field]: e.target.value})} className="w-full bg-slate-700 p-2 rounded mt-1"/> 
                            : <p className="break-words">{profile[field] || 'Not set'}</p>
                        }
                    </div>
                ))}
                 <div>
                    <label className="text-xs text-yellow-400">Description</label>
                    {editing ? 
                        <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-700 p-2 rounded h-24 mt-1"/> 
                        : <p className="text-sm break-words">{profile.description || 'No description yet.'}</p>
                    }
                </div>
                <div>
                    <label className="text-xs text-yellow-400">Skillset</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {profile.skillset.length > 0 ? profile.skillset.map(skill => (
                            <span key={skill} className="bg-indigo-600 px-3 py-1 text-sm rounded-full">{skill}</span>
                        )) : <p>No skills. Go to Home to add skills.</p>}
                    </div>
                </div>
                {editing && <button onClick={handleSave} className="w-full bg-yellow-400 text-black font-bold py-2 rounded-lg mt-4">Save Changes</button>}
            </div>
             <button onClick={onSignOut} className="w-full bg-red-600 text-white font-bold py-2 rounded-lg mt-6">Sign Out</button>
        </div>
    );
}
