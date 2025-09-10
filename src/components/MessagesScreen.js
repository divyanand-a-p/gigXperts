import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const MessagesScreen = ({ setScreen, setActiveChat }) => {
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const chatsQuery = query(collection(db, 'chats'), where('participants', 'array-contains', auth.currentUser.uid));

    const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
      try {
        const chatsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const userIds = new Set();
        chatsData.forEach(chat => {
          if (chat.participants && Array.isArray(chat.participants)) {
            chat.participants.forEach(uid => userIds.add(uid));
          }
        });

        if (userIds.size > 0) {
          // Firestore 'in' queries are limited to 10 items. We need to chunk the userIds array.
          const userIdsArray = Array.from(userIds);
          const userChunks = [];
          for (let i = 0; i < userIdsArray.length; i += 10) {
            userChunks.push(userIdsArray.slice(i, i + 10));
          }

          const usersData = {};
          // Execute a query for each chunk of user IDs
          for (const chunk of userChunks) {
            const usersQuery = query(collection(db, 'users'), where('uid', 'in', chunk));
            const usersSnapshot = await getDocs(usersQuery);
            usersSnapshot.forEach(doc => {
              usersData[doc.data().uid] = doc.data();
            });
          }
          setUsers(usersData);
        }

        setChats(chatsData);
      } catch (error) {
        console.error("Error processing chat data: ", error);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error("Error fetching chats snapshot: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChatClick = (chatId, otherUserId) => {
    setActiveChat({ chatId, otherUserId });
    setScreen('chat');
  };

  if (loading) {
    return <div className="p-4 text-white text-center">Loading messages...</div>;
  }

  if (chats.length === 0) {
    return <div className="p-4 text-white text-center">No messages yet.</div>;
  }

  return (
    <div className="p-4 flex flex-col h-full text-white">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <div className="flex-grow overflow-y-auto">
        {chats.map(chat => {
          if (!chat || !chat.participants || !Array.isArray(chat.participants)) {
            return null; 
          }

          const otherUserId = chat.participants.find(uid => uid !== auth.currentUser.uid);
          if (!otherUserId) return null;

          const otherUser = users[otherUserId];
          if (!otherUser) {
            // This can happen briefly while user data is loading, so we can show a placeholder.
            return null;
          }
          
          return (
            <div
              key={chat.id}
              onClick={() => handleChatClick(chat.id, otherUserId)}
              className="flex items-center p-3 mb-2 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
            >
              <img src={otherUser.photoURL || `https://ui-avatars.com/api/?name=${otherUser.displayName}&background=0ea5e9&color=fff`} alt={otherUser.displayName || ''} className="w-12 h-12 rounded-full mr-4" />
              <div>
                <p className="font-semibold">{otherUser.displayName || 'User'}</p>
                <p className="text-sm text-gray-400 truncate">{chat.lastMessage?.text || "..."}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MessagesScreen;
