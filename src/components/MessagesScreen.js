import React, 'useState', useEffect } from 'react';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

export default function MessagesScreen({ currentUser, setView, setViewData }) {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('participants', 'array-contains', currentUser.uid));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const chatPromises = snapshot.docs.map(async (doc) => {
                const chatData = doc.data();
                // Safety Check: Ensure chatData and participants exist
                if (!chatData || !Array.isArray(chatData.participants)) return null;

                const otherParticipantId = chatData.participants.find(p => p !== currentUser.uid);
                if (otherParticipantId) {
                    const userDoc = await getDoc(doc(db, 'users', otherParticipantId));
                    if (userDoc.exists()) {
                        return { id: doc.id, ...chatData, partner: userDoc.data() };
                    }
                }
                return null;
            });
            
            const resolvedChats = (await Promise.all(chatPromises)).filter(Boolean);
            resolvedChats.sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));
            setChats(resolvedChats);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser.uid]);

    if (loading) return <p className="text-center text-slate-400">Loading messages...</p>;

    if (chats.length === 0) {
        return <p className="text-center text-slate-400 mt-10">No messages yet</p>;
    }
    
    return (
        <div className="space-y-2">
            {chats.map(chat => {
                // Safety Check: Ensure chat and partner data are valid before rendering
                if (!chat || !chat.partner) return null;

                return (
                    <div key={chat.id} onClick={() => { setViewData(chat.partner); setView('chat'); }} className="flex items-center p-3 bg-[#1e293b] rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                        <img src={chat.partner.photoURL || `https://placehold.co/48x48/1e293b/E0E1DD?text=${chat.partner.name.charAt(0)}`} alt={chat.partner.name} className="w-12 h-12 rounded-full mr-4"/>
                        <div className="flex-grow overflow-hidden">
                            <p className="font-bold">{chat.partner.name}</p>
                            <p className="text-sm text-slate-400 truncate">{chat.lastMessage?.text || "Tap to start conversation"}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
