import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';

// --- Firebase Configuration ---
// This is the configuration you provided.
const firebaseConfig = {
    apiKey: "AIzaSyCJqBSK_xuQYMBmD5s5v-trAnnH10NMcZA",
    authDomain: "gigxperts-46aee.firebaseapp.com",
    projectId: "gigxperts-46aee",
    storageBucket: "gigxperts-46aee.appspot.com",
    messagingSenderId: "63003889769",
    appId: "1:63003889769:web:f58319dbad2735cad692f8"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// --- Main App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState('home'); // home, community, messages, profile
    const [view, setView] = useState(null); // Used for sub-pages like 'photographers', 'userProfile', 'chat' etc.
    const [viewData, setViewData] = useState(null); // Data for the sub-page
    const [toast, setToast] = useState(''); // For "Coming Soon" messages

    // --- Authentication Listener ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setProfile(userDocSnap.data());
                } else {
                    // Create a new profile for the user
                    const newProfile = {
                        uid: currentUser.uid,
                        name: currentUser.displayName,
                        email: currentUser.email,
                        photoURL: currentUser.photoURL,
                        mobile: '',
                        linkedin: '',
                        github: '',
                        instagram: '',
                        description: '',
                        skillset: [],
                        connections: [],
                        connectionRequests: [],
                        createdAt: serverTimestamp(),
                    };
                    await setDoc(userDocRef, newProfile);
                    setProfile(newProfile);
                }
                setUser(currentUser);
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- Toast Message Handler ---
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [toast]);


    const handleSignIn = async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in: ", error);
        }
    };

    const handleSignOut = async () => {
        await signOut(auth);
        setPage('home');
        setView(null);
    };

    // --- Render Logic ---
    if (loading) {
        return <LoadingScreen />;
    }

    if (!user) {
        return <LoginScreen onSignIn={handleSignIn} />;
    }

    const renderContent = () => {
        if (view) {
            switch (view) {
                case 'photographers':
                    return <PhotographyListScreen setView={setView} setViewData={setViewData} />;
                case 'userProfile':
                    return <UserProfileScreen profileData={viewData} currentUserProfile={profile} setView={setView} setViewData={setViewData} setToast={setToast}/>;
                case 'notifications':
                    return <NotificationsScreen currentUserProfile={profile} setProfile={setProfile} setView={setView} />;
                case 'createTeamRequest':
                    return <CreateTeamRequestScreen setView={setView} currentUserProfile={profile} setToast={setToast}/>
                case 'chat':
                    return <ChatScreen chatPartner={viewData} currentUser={user} setView={setView} />;
                case 'payment':
                     return <PaymentScreen setView={setView} setToast={setToast} />;
                default:
                    setView(null); // Fallback to home if view is unknown
                    return null;
            }
        }

        switch (page) {
            case 'home':
                return <HomeScreen profile={profile} setProfile={setProfile} setView={setView} setToast={setToast} />;
            case 'community':
                return <CommunityScreen setView={setView} setViewData={setViewData} />;
            case 'messages':
                return <MessagesScreen currentUser={user} setView={setView} setViewData={setViewData} />;
            case 'profile':
                return <ProfileScreen profile={profile} onSignOut={handleSignOut} setProfile={setProfile} setToast={setToast}/>;
            default:
                return <HomeScreen profile={profile} setProfile={setProfile} setView={setView} setToast={setToast} />;
        }
    };

    return (
        <div className="bg-[#0d1b2a] min-h-screen font-sans text-white max-w-md mx-auto shadow-2xl flex flex-col">
            <Header setPage={setPage} setView={setView} page={page} view={view} />
            <main className="flex-grow p-4 overflow-y-auto">
                {renderContent()}
            </main>
            {!view && <BottomNav page={page} setPage={setPage} />}
            {toast && <Toast message={toast} />}
        </div>
    );
}


// --- SCREENS & COMPONENTS ---

function LoadingScreen() {
    return (
        <div className="flex items-center justify-center h-screen bg-[#0d1b2a]">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4 animate-pulse">GigXperts</h1>
                <p className="text-indigo-300">Loading your expert network...</p>
            </div>
        </div>
    );
}

function LoginScreen({ onSignIn }) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#0d1b2a] p-8">
            <h1 className="text-5xl font-bold text-white mb-8">GigXperts</h1>
            <p className="text-indigo-200 text-center mb-12">Your College's Exclusive Freelance Network.</p>
            <button
                onClick={onSignIn}
                className="w-full max-w-xs bg-white text-gray-800 font-semibold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center transition-transform transform hover:scale-105"
            >
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" className="w-6 h-6 mr-4" />
                Sign In Using Google
            </button>
        </div>
    );
}

function Header({ setPage, setView, page, view }) {
    const isSubPage = !!view;
    const handleBack = () => setView(null);
    const title = isSubPage ? view.charAt(0).toUpperCase() + view.slice(1).replace(/([A-Z])/g, ' $1').trim() : "GigXperts";

    return (
        <header className="bg-[#1b263b] p-4 flex items-center justify-between shadow-md sticky top-0 z-10">
            <div className="flex items-center space-x-4">
                {isSubPage ? (
                    <button onClick={handleBack} className="text-2xl text-yellow-400">&larr;</button>
                ) : (
                    <button className="text-3xl">&#9776;</button>
                )}
                <h1 className="text-xl font-bold tracking-wider">{title}</h1>
            </div>
            {!isSubPage && page === 'home' && (
                 <button onClick={() => setView('notifications')} className="text-2xl text-yellow-400">&#128276;</button>
            )}
        </header>
    );
}


function BottomNav({ page, setPage }) {
    const navItems = [
        { name: 'home', icon: '🏠' },
        { name: 'community', icon: '👥' },
        { name: 'messages', icon: '✉️' },
        { name: 'profile', icon: '👤' },
    ];
    return (
        <nav className="bg-[#1b263b] p-2 flex justify-around sticky bottom-0 z-10">
            {navItems.map(item => (
                <button
                    key={item.name}
                    onClick={() => setPage(item.name)}
                    className={`text-3xl p-3 rounded-full ${page === item.name ? 'bg-yellow-400' : ''}`}
                >
                    {item.icon}
                </button>
            ))}
        </nav>
    );
}

function Toast({ message }) {
    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-2 rounded-full shadow-lg z-50">
            {message}
        </div>
    );
}

// --- Page Components ---

function HomeScreen({ profile, setProfile, setView, setToast }) {
    const [hireApplyToggle, setHireApplyToggle] = useState('apply');
    const skills = [
        { name: 'WRITER', icon: '✍️', enabled: false },
        { name: 'CODING', icon: '💻', enabled: false },
        { name: 'VIDEO EDITING', icon: '🎬', enabled: false },
        { name: 'PHOTOGRAPHY', icon: '📷', enabled: true },
        { name: 'POSTER MAKING', icon: '🎨', enabled: false },
        { name: 'PRESENTATION', icon: '📊', enabled: false },
        { name: 'PROJECT MAKING', icon: '🛠️', enabled: false },
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
            <div className="bg-[#1b263b] rounded-full p-1 flex mb-6">
                <button
                    onClick={() => setHireApplyToggle('hire')}
                    className={`w-1/2 py-2 rounded-full font-semibold ${hireApplyToggle === 'hire' ? 'bg-[#415a77] text-white' : 'text-gray-400'}`}
                >HIRE</button>
                <button
                    onClick={() => setHireApplyToggle('apply')}
                    className={`w-1/2 py-2 rounded-full font-semibold ${hireApplyToggle === 'apply' ? 'bg-yellow-400 text-black' : 'text-gray-400'}`}
                >APPLY</button>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {skills.map(skill => (
                    <div key={skill.name} className="text-center">
                        <button
                            onClick={() => handleCategoryClick(skill)}
                            className={`w-full h-24 bg-[#1b263b] rounded-lg flex items-center justify-center text-4xl mb-2 ${skill.enabled ? 'cursor-pointer hover:bg-[#415a77]' : 'opacity-50 cursor-not-allowed'}`}
                        >
                            {skill.icon}
                        </button>
                        <p className="text-xs font-semibold">{skill.name}</p>
                        {hireApplyToggle === 'apply' && (
                            <button onClick={() => handleSkillToggle(skill.name)} className="mt-1 text-xs px-2 py-0.5 rounded-full bg-indigo-500 hover:bg-indigo-400">
                                {profile.skillset.includes(skill.name) ? 'Selected ✓' : 'Add Skill +'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function CommunityScreen({ setView, setViewData }) {
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

    if (loading) return <p>Loading team requests...</p>;

    return (
        <div className="relative h-full">
            {teamRequests.length === 0 ? (
                 <p className="text-center text-gray-400 mt-10">No team requests yet. Be the first to create one!</p>
            ) : (
                <div className="space-y-4">
                    {teamRequests.map(req => (
                        <div key={req.id} className="bg-[#1b263b] p-4 rounded-lg shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-yellow-400">{req.eventName}</h3>
                                    <p className="text-sm text-gray-300">LOOKING FOR: <span className="font-semibold">{req.skillNeeded}</span></p>
                                </div>
                                <div className="text-right">
                                     <p className="font-mono bg-gray-700 px-2 py-1 rounded">{req.membersFilled}/{req.membersNeeded}</p>
                                     <button onClick={() => handleChatRequest(req)} className="mt-2 text-3xl font-bold bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center">i</button>
                                </div>
                            </div>
                            <p className="text-sm mt-2 pt-2 border-t border-gray-700">{req.description}</p>
                        </div>
                    ))}
                </div>
            )}
            <button onClick={() => setView('createTeamRequest')} className="absolute bottom-4 right-4 bg-yellow-400 text-black w-14 h-14 rounded-full text-4xl flex items-center justify-center shadow-lg">+</button>
        </div>
    );
}

function MessagesScreen({ currentUser, setView, setViewData }) {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('participants', 'array-contains', currentUser.uid));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const chatPromises = snapshot.docs.map(async (doc) => {
                const chatData = doc.data();
                const otherParticipantId = chatData.participants.find(p => p !== currentUser.uid);
                if (otherParticipantId) {
                    const userDoc = await getDoc(doc(db, 'users', otherParticipantId));
                    if (userDoc.exists()) {
                        return {
                            id: doc.id,
                            ...chatData,
                            partner: userDoc.data()
                        };
                    }
                }
                return null;
            });
            
            const resolvedChats = (await Promise.all(chatPromises)).filter(Boolean);
            
            // Sort chats by the timestamp of the last message
            resolvedChats.sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));

            setChats(resolvedChats);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser.uid]);

    if (loading) return <p>Loading messages...</p>;

    if (chats.length === 0) {
        return <p className="text-center text-gray-400 mt-10">No messages yet</p>;
    }
    
    return (
        <div className="space-y-2">
            {chats.map(chat => (
                <div key={chat.id} onClick={() => { setViewData(chat.partner); setView('chat'); }} className="flex items-center p-3 bg-[#1b263b] rounded-lg cursor-pointer hover:bg-[#415a77]">
                    <img src={chat.partner.photoURL || `https://placehold.co/40x40/778DA9/E0E1DD?text=${chat.partner.name.charAt(0)}`} alt={chat.partner.name} className="w-12 h-12 rounded-full mr-4"/>
                    <div className="flex-grow">
                        <p className="font-bold">{chat.partner.name}</p>
                        <p className="text-sm text-gray-400 truncate">{chat.lastMessage?.text || 'Tap to start conversation'}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function ProfileScreen({ profile, onSignOut, setProfile, setToast }) {
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ ...profile });

    const handleSave = async () => {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, {
            mobile: formData.mobile,
            linkedin: formData.linkedin,
            github: formData.github,
            instagram: formData.instagram,
            description: formData.description,
        });
        setProfile({ ...profile, ...formData });
        setEditing(false);
        setToast("Profile updated successfully!");
    };
    
    return (
        <div className="p-4 bg-[#1b263b] rounded-lg">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                    <img src={profile.photoURL} alt={profile.name} className="w-16 h-16 rounded-full mr-4" />
                    <div>
                        <h2 className="text-2xl font-bold">{profile.name}</h2>
                        <p className="text-sm text-gray-400">{profile.connections.length} connections</p>
                    </div>
                </div>
                <button onClick={() => setEditing(!editing)} className="text-2xl">{editing ? '❌' : '✏️'}</button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs text-yellow-400">Mobile</label>
                    {editing ? <input type="tel" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="w-full bg-gray-700 p-2 rounded"/> : <p>{profile.mobile || 'Not set'}</p>}
                </div>
                 <div>
                    <label className="text-xs text-yellow-400">LinkedIn</label>
                    {editing ? <input type="text" value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} className="w-full bg-gray-700 p-2 rounded"/> : <p>{profile.linkedin || 'Not set'}</p>}
                </div>
                 <div>
                    <label className="text-xs text-yellow-400">GitHub</label>
                    {editing ? <input type="text" value={formData.github} onChange={(e) => setFormData({...formData, github: e.target.value})} className="w-full bg-gray-700 p-2 rounded"/> : <p>{profile.github || 'Not set'}</p>}
                </div>
                 <div>
                    <label className="text-xs text-yellow-400">Instagram</label>
                    {editing ? <input type="text" value={formData.instagram} onChange={(e) => setFormData({...formData, instagram: e.target.value})} className="w-full bg-gray-700 p-2 rounded"/> : <p>{profile.instagram || 'Not set'}</p>}
                </div>
                 <div>
                    <label className="text-xs text-yellow-400">Description</label>
                    {editing ? <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-700 p-2 rounded h-24"/> : <p className="text-sm">{profile.description || 'No description yet.'}</p>}
                </div>
                <div>
                    <label className="text-xs text-yellow-400">Skillset</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {profile.skillset.length > 0 ? profile.skillset.map(skill => (
                            <span key={skill} className="bg-indigo-500 px-3 py-1 text-sm rounded-full">{skill}</span>
                        )) : <p>No skills selected. Go to Home to add skills.</p>}
                    </div>
                </div>
                {editing && <button onClick={handleSave} className="w-full bg-yellow-400 text-black font-bold py-2 rounded-lg mt-4">Save Changes</button>}
            </div>
             <button onClick={onSignOut} className="w-full bg-red-600 text-white font-bold py-2 rounded-lg mt-6">Sign Out</button>
        </div>
    );
}

// --- Sub-Page Components ---

function PhotographyListScreen({ setView, setViewData }) {
    const [photographers, setPhotographers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'users'), where('skillset', 'array-contains', 'PHOTOGRAPHY'));
        const fetchPhotographers = async () => {
            const querySnapshot = await getDocs(q);
            const photographersList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1) // Random rating between 3.5 and 5.0
            }));
            setPhotographers(photographersList);
            setLoading(false);
        };
        fetchPhotographers();
    }, []);

    const handleUserClick = (photographer) => {
        setViewData(photographer);
        setView('userProfile');
    };
    
    if (loading) return <p>Finding photographers...</p>;

    return (
        <div>
            <div className="text-center mb-4 bg-gray-700 p-2 rounded-lg font-bold">PHOTOGRAPHY</div>
            <div className="space-y-3">
                {photographers.map(p => (
                    <div key={p.id} onClick={() => handleUserClick(p)} className="flex items-center justify-between p-3 bg-[#1b263b] rounded-lg cursor-pointer hover:bg-[#415a77]">
                        <div className="flex items-center">
                            <img src={p.photoURL} alt={p.name} className="w-10 h-10 rounded-full mr-3"/>
                            <span className="font-semibold">{p.name}</span>
                        </div>
                        <span className="flex items-center">⭐ {p.rating}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function UserProfileScreen({ profileData, currentUserProfile, setView, setViewData, setToast }) {
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
        <div className="p-4 bg-[#1b263b] rounded-lg">
            <div className="text-center mb-4">
                <img src={profileData.photoURL} alt={profileData.name} className="w-24 h-24 rounded-full mx-auto mb-2"/>
                <h2 className="text-2xl font-bold">{profileData.name}</h2>
                <p className="text-yellow-400">⭐ {profileData.rating || '4.5'}</p>
                <p className="text-sm text-gray-400">{profileData.connections.length} connections</p>
            </div>
            <div className="text-sm mb-6">
                <h3 className="font-bold text-lg mb-2 border-b border-gray-700 pb-1">Description</h3>
                <p>{profileData.description || 'No description provided.'}</p>
            </div>
             <div className="text-sm mb-6">
                <h3 className="font-bold text-lg mb-2 border-b border-gray-700 pb-1">Skillset</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                    {profileData.skillset.map(skill => (
                        <span key={skill} className="bg-indigo-500 px-3 py-1 text-sm rounded-full">{skill}</span>
                    ))}
                </div>
            </div>
             <div className="text-sm mb-6">
                <h3 className="font-bold text-lg mb-2 border-b border-gray-700 pb-1">Contact & Links</h3>
                <p><strong>Mobile:</strong> {profileData.mobile || 'N/A'}</p>
                <p><strong>LinkedIn:</strong> {profileData.linkedin || 'N/A'}</p>
                <p><strong>GitHub:</strong> {profileData.github || 'N/A'}</p>
                <p><strong>Instagram:</strong> {profileData.instagram || 'N/A'}</p>
            </div>
            {!isCurrentUser && (
                 <div className="flex space-x-2">
                    <button onClick={handleConnect} disabled={isAlreadyConnected || hasSentRequest} className="w-full bg-yellow-400 text-black font-bold py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                        {isAlreadyConnected ? 'Connected' : hasSentRequest ? 'Request Sent' : 'Connect'}
                    </button>
                    <button onClick={handleMessage} className="w-full bg-indigo-500 text-white font-bold py-2 rounded-lg">Message</button>
                 </div>
            )}
        </div>
    );
}

function NotificationsScreen({ currentUserProfile, setProfile, setView }) {
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

        // Remove request from current user's list
        await updateDoc(currentUserRef, {
            connectionRequests: arrayRemove(targetId)
        });

        if (accept) {
            // Add connection to both users
            await updateDoc(currentUserRef, {
                connections: arrayUnion(targetId)
            });
            await updateDoc(targetUserRef, {
                connections: arrayUnion(currentUserProfile.uid)
            });
        }
        
        // Refresh local profile state
        const updatedProfileSnap = await getDoc(currentUserRef);
        setProfile(updatedProfileSnap.data());
    };

    if (loading) return <p>Loading notifications...</p>;
    
    if (requests.length === 0) {
        return <p className="text-center text-gray-400 mt-10">No new notifications</p>
    }

    return (
        <div className="space-y-3">
            {requests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-3 bg-[#1b263b] rounded-lg">
                    <div className="flex items-center">
                         <img src={req.photoURL} alt={req.name} className="w-10 h-10 rounded-full mr-3"/>
                        <span className="font-semibold">{req.name}</span>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => handleRequest(req.id, true)} className="bg-green-500 w-10 h-10 rounded-full text-xl flex items-center justify-center">✓</button>
                        <button onClick={() => handleRequest(req.id, false)} className="bg-red-500 w-10 h-10 rounded-full text-xl flex items-center justify-center">×</button>
                    </div>
                </div>
            ))}
        </div>
    );
}


function CreateTeamRequestScreen({setView, currentUserProfile, setToast}) {
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
            membersFilled: 1, // The creator is the first member
            createdAt: serverTimestamp()
        });
        setToast("Team request posted!");
        setView(null);
    }
    
    return (
        <form onSubmit={handleSubmit} className="p-4 bg-[#1b263b] rounded-lg space-y-4">
             <h2 className="text-xl font-bold text-center text-yellow-400">Create Team Request</h2>
             <div>
                <label className="text-xs">Event Name (e.g., Hackathon)</label>
                <input type="text" value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} className="w-full bg-gray-700 p-2 rounded mt-1" />
             </div>
              <div>
                <label className="text-xs">Skill Needed</label>
                <input type="text" value={formData.skillNeeded} onChange={e => setFormData({...formData, skillNeeded: e.target.value})} className="w-full bg-gray-700 p-2 rounded mt-1" />
             </div>
             <div>
                <label className="text-xs">Total Team Members Needed</label>
                <input type="number" min="2" max="10" value={formData.membersNeeded} onChange={e => setFormData({...formData, membersNeeded: e.target.value})} className="w-full bg-gray-700 p-2 rounded mt-1" />
             </div>
             <div>
                <label className="text-xs">Short Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-700 p-2 rounded mt-1 h-20" />
             </div>
             <button type="submit" className="w-full bg-yellow-400 text-black font-bold py-2 rounded-lg">Post Request</button>
        </form>
    );
}

function ChatScreen({ chatPartner, currentUser, setView }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatId, setChatId] = useState(null);
    const messagesEndRef = React.useRef(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        const getOrCreateChat = async () => {
            const participants = [currentUser.uid, chatPartner.uid].sort();
            const chatId = participants.join('_');
            const chatRef = doc(db, 'chats', chatId);
            const chatSnap = await getDoc(chatRef);

            if (!chatSnap.exists()) {
                await setDoc(chatRef, { participants });
            }
            setChatId(chatId);
        };
        getOrCreateChat();
    }, [currentUser.uid, chatPartner.uid]);

    useEffect(() => {
        if (!chatId) return;
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => doc.data()));
        });
        return () => unsubscribe();
    }, [chatId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !chatId) return;
        
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const messageData = {
            text: newMessage,
            senderId: currentUser.uid,
            timestamp: serverTimestamp()
        };
        
        await addDoc(messagesRef, messageData);
        
        // Update last message on the chat document
        await updateDoc(doc(db, 'chats', chatId), {
            lastMessage: messageData
        });

        setNewMessage('');
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col bg-[#0d1b2a]">
             <div className="p-3 bg-[#1b263b] flex items-center shadow-md">
                 <img src={chatPartner.photoURL} alt={chatPartner.name} className="w-10 h-10 rounded-full mr-3"/>
                 <p className="font-bold">{chatPartner.name}</p>
             </div>
             <div className="flex-grow p-4 overflow-y-auto">
                 {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'} mb-3`}>
                        <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.senderId === currentUser.uid ? 'bg-indigo-500 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                            <p>{msg.text}</p>
                        </div>
                    </div>
                 ))}
                 <div ref={messagesEndRef} />
             </div>
             <form onSubmit={handleSendMessage} className="p-4 bg-[#1b263b] flex items-center space-x-2">
                <button type="button" onClick={() => setView('payment')} className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg">FEE</button>
                 <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message"
                    className="flex-grow bg-gray-700 p-2 rounded-lg focus:outline-none"
                 />
                 <button type="submit" className="text-2xl">➡️</button>
             </form>
        </div>
    );
}

function PaymentScreen({ setView, setToast }) {
    const [amount, setAmount] = useState('');

    const handleKeyPress = (key) => {
        if (key === 'del') {
            setAmount(amount.slice(0, -1));
        } else if (amount.length < 6) {
            setAmount(amount + key);
        }
    };
    
    const handlePayment = () => {
        if (parseInt(amount) > 0) {
            setToast(`Redirecting to Razorpay for ₹${amount}...`);
            // In a real app, you would integrate the Razorpay SDK here.
            // For this MVP, we will simulate by redirecting.
            setTimeout(() => {
                 window.open('https://razorpay.com/', '_blank');
            }, 1500);
        } else {
            setToast('Please enter a valid amount');
        }
    };

    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0'];

    return (
         <div className="p-4 bg-[#1b263b] rounded-lg flex flex-col items-center">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">Enter Amount</h2>
            <div className="w-full text-center bg-gray-800 p-4 rounded-lg text-4xl font-mono mb-6 h-20">
                ₹{amount || '0'}
            </div>
            <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
                {keys.map(key => (
                     <button key={key} onClick={() => handleKeyPress(key)} className="bg-gray-700 text-2xl h-16 rounded-lg flex items-center justify-center hover:bg-gray-600">
                        {key === 'del' ? '⌫' : key}
                     </button>
                ))}
                <button onClick={handlePayment} className="col-span-3 bg-yellow-400 text-black font-bold h-16 rounded-lg text-2xl">→</button>
            </div>
         </div>
    );
}