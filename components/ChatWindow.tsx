import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';
import { Send, Search, MoreVertical, Phone, Video, MailCheck } from 'lucide-react';

interface ChatWindowProps {
  currentUser: User;
  initialContactId?: string;
  allUsers: User[];
  messages: Message[];
  onSendMessage: (content: string, receiverId: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  currentUser, 
  initialContactId, 
  allUsers,
  messages,
  onSendMessage
}) => {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(initialContactId || null);
  const [newMessage, setNewMessage] = useState('');
  const [emailSentNotice, setEmailSentNotice] = useState<{show: boolean, name: string}>({show: false, name: ''});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update selected contact if initialContactId changes (e.g., coming from AdCard)
  useEffect(() => {
    if (initialContactId) {
      setSelectedContactId(initialContactId);
    }
  }, [initialContactId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedContactId]);

  // Get unique contacts based on message history + include the initialContact if not present
  const contactIds = Array.from(new Set([
    ...messages.filter(m => m.senderId === currentUser.id).map(m => m.receiverId),
    ...messages.filter(m => m.receiverId === currentUser.id).map(m => m.senderId),
    initialContactId
  ])).filter(id => id && id !== currentUser.id);

  // Filter full user objects
  const contacts = allUsers.filter(u => contactIds.includes(u.id));

  // If we have a selected contact but they aren't in the list (mock data issue), find them in allUsers
  const activeContact = selectedContactId 
    ? allUsers.find(u => u.id === selectedContactId) 
    : null;

  // Filter messages for current conversation
  const currentConversation = selectedContactId 
    ? messages.filter(m => 
        (m.senderId === currentUser.id && m.receiverId === selectedContactId) ||
        (m.senderId === selectedContactId && m.receiverId === currentUser.id)
      ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContactId) return;
    
    onSendMessage(newMessage, selectedContactId);
    
    // Simulation de l'envoi d'email
    if (activeContact) {
      setEmailSentNotice({ show: true, name: activeContact.name });
      setTimeout(() => setEmailSentNotice({ show: false, name: '' }), 3000);
    }

    setNewMessage('');
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex my-4 relative">
      
      {/* Email Notification Toast */}
      {emailSentNotice.show && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fade-in-down">
          <MailCheck size={16} className="text-green-400" />
          <span className="text-sm">Email de notification envoyé à {emailSentNotice.name}</span>
        </div>
      )}

      {/* Sidebar - Contact List */}
      <div className={`w-full md:w-1/3 border-r border-gray-100 flex flex-col ${selectedContactId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Messagerie</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto">
          {contacts.length > 0 ? (
            contacts.map(contact => (
              <div 
                key={contact.id}
                onClick={() => setSelectedContactId(contact.id)}
                className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-50 ${selectedContactId === contact.id ? 'bg-teal-50 border-l-4 border-l-primary' : ''}`}
              >
                <div className="relative">
                  <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-gray-800 truncate">{contact.name}</h3>
                    <span className="text-xs text-gray-400">12:30</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">Cliquez pour voir la discussion...</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400">
              <p>Aucune conversation récente.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`w-full md:w-2/3 flex flex-col ${!selectedContactId ? 'hidden md:flex' : 'flex'}`}>
        {activeContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <div className="flex items-center space-x-3">
                <button 
                  className="md:hidden text-gray-500"
                  onClick={() => setSelectedContactId(null)}
                >
                  ←
                </button>
                <img src={activeContact.avatar} alt={activeContact.name} className="w-10 h-10 rounded-full" />
                <div>
                  <h3 className="font-bold text-gray-800">{activeContact.name}</h3>
                  <p className="text-xs text-green-600 flex items-center">● En ligne</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-primary">
                <button className="p-2 hover:bg-gray-100 rounded-full"><Phone size={20} /></button>
                <button className="p-2 hover:bg-gray-100 rounded-full"><Video size={20} /></button>
                <button className="p-2 hover:bg-gray-100 rounded-full"><MoreVertical size={20} /></button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-grow p-4 overflow-y-auto bg-slate-50 space-y-4">
              {currentConversation.length > 0 ? (
                currentConversation.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
                          isMe 
                            ? 'bg-primary text-white rounded-tr-none' 
                            : 'bg-white text-gray-800 rounded-tl-none'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-teal-100' : 'text-gray-400'}`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <p>Commencez la discussion avec {activeContact.name}</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSend} className="flex items-center space-x-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="flex-grow px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-primary text-white rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-slate-50 text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Send size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-600">Vos messages</h3>
            <p>Sélectionnez une conversation pour commencer à discuter.</p>
          </div>
        )}
      </div>
    </div>
  );
};