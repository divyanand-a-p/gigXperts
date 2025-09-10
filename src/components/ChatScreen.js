import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { icons } from '../assets';

export default function HomeScreen({ profile, setProfile, setView, setToast }) {
    const [hireApplyToggle, setHireApplyToggle] = useState('apply');
    const skills = [
        { name: 'WRITER', icon: icons.writer, enabled: false },
        { name: 'CODING', icon: icons.coding, enabled: false },
        { name: 'VIDEO EDITING', icon: icons.video, enabled: false },
        { name: 'PHOTOGRAPHY', icon: icons.photography, enabled: true },
        { name: 'POSTER MAKING', icon: icons.poster, enabled: false },
        { name: 'PRESENTATION', icon: icons.presentation, enabled: false },
        { name: 'PROJECT MAKING', icon: icons.project, enabled: false },
    ];

    const handleSkillToggle = async (skillName) => {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        let updatedSkillset;
        if (profile.skillset.includes(skillName)) {
            updatedSkillset = arrayRemove(skillName);
            setToast(`${skillName} removed from your skills`);
        } else {
            updatedSkillset = arrayUnion(skillName);
            setToast(`${skillName} added to your skills!`);
        }
        await updateDoc(userDocRef, { skillset: updatedSkillset });
        // Fetch the updated document to ensure state is in sync
        const updatedProfile = { ...profile, skillset: (await getDoc(userDocRef)).data().skillset };
        setProfile(updatedProfile);
    };

    const handleCategoryClick = (skill) => {
        if (!skill.enabled) {
            setToast('This feature is coming soon!');
            return;
        }
        if (skill.name === 'PHOTOGRAPHY') {
            setView('photographers');
        }
    };

    return (
        <div>
            <div className="bg-[#1e293b] rounded-full p-1 flex mb-6">
                <button
                    onClick={() => setHireApplyToggle('hire')}
                    className={`w-1/2 py-2 rounded-full font-semibold transition-colors ${hireApplyToggle === 'hire' ? 'bg-slate-500 text-white' : 'text-slate-400'}`}
                >HIRE</button>
                <button
                    onClick={() => setHireApplyToggle('apply')}
                    className={`w-1/2 py-2 rounded-full font-semibold transition-colors ${hireApplyToggle === 'apply' ? 'bg-yellow-400 text-black' : 'text-slate-400'}`}
                >APPLY</button>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {skills.map(skill => (
                    <div key={skill.name} className="text-center">
                        <button
                            onClick={() => handleCategoryClick(skill)}
                            className={`w-full h-24 bg-[#1e293b] rounded-lg flex items-center justify-center p-4 transition-colors ${skill.enabled ? 'cursor-pointer hover:bg-slate-600' : 'opacity-50 cursor-not-allowed'}`}
                        >
                            <img src={skill.icon} alt={skill.name} className="w-12 h-12" />
                        </button>
                        <p className="text-xs font-semibold mt-2">{skill.name}</p>
                        {hireApplyToggle === 'apply' && (
                            <button onClick={() => handleSkillToggle(skill.name)} className="mt-1 text-xs px-2 py-0.5 rounded-full bg-indigo-600 hover:bg-indigo-500 transition-colors">
                                {profile.skillset.includes(skill.name) ? 'Selected ✓' : 'Add Skill +'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
