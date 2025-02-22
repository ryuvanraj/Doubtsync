import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';

interface Chat {
  id: number;
  name: string;
  image: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  image?: string | null;
  time: string;
  isSender: boolean;
}

export default function IntegratedChat({ user = { id: 'current-user' } }) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [image, setImage] = useState<string | null>(null);

  // Simulated chat data
  const chats = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      image: "/api/placeholder/256/256",
      lastMessage: "I can help you with that calculus problem",
      time: "2m ago",
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: "Prof. Michael Chen",
      image: "/api/placeholder/256/256",
      lastMessage: "Let's schedule our next session",
      time: "1h ago",
      unread: 0,
      online: false
    }
  ];

  // Simulated initial messages
  const initialMessages = [
    {
      id: 1,
      sender_id: 'current-user',
      receiver_id: '1',
      content: "Hi, I need help with calculus",
      time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      isSender: true
    },
    {
      id: 2,
      sender_id: '1',
      receiver_id: 'current-user',
      content: "Of course! What specific topic are you struggling with?",
      time: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
      isSender: false
    }
  ];

  useEffect(() => {
    if (selectedChat) {
      // Load messages for selected chat
      setMessages(initialMessages);
    }
  }, [selectedChat]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = () => {
    if (!selectedChat || (!message.trim() && !image)) return;

    const newMessage = {
      id: messages.length + 1,
      sender_id: user.id,
      receiver_id: selectedChat.id.toString(),
      content: message,
      image,
      time: new Date().toISOString(),
      isSender: true
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Simulate received message
    setTimeout(() => {
      const receivedMessage = {
        id: messages.length + 2,
        sender_id: selectedChat.id.toString(),
        receiver_id: user.id,
        content: `This is a simulated response to: "${message}"`,
        time: new Date().toISOString(),
        isSender: false
      };
      setMessages(prev => [...prev, receivedMessage]);
    }, 1000);

    setMessage('');
    setImage(null);
  };

  return (
    <div className="bg-white rounded-lg shadow h-[calc(100vh-12rem)] flex">
      {/* Chat List */}
      <div className="w-1/3 border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Messages</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`w-full p-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors ${
                selectedChat?.id === chat.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={chat.image}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium">{chat.name}</h3>
                <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{chat.time}</p>
                {chat.unread > 0 && (
                  <span className="inline-block bg-blue-600 text-white text-xs rounded-full px-2 py-1 mt-1">
                    {chat.unread}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b flex items-center space-x-4">
            <div className="relative">
              <img
                src={selectedChat.image}
                alt={selectedChat.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {selectedChat.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <h3 className="font-medium">{selectedChat.name}</h3>
              <p className="text-sm text-gray-500">
                {selectedChat.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isSender ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.isSender
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p>{msg.content}</p>
                  {msg.image && (
                    <img 
                      src={msg.image} 
                      alt="Attached" 
                      className="mt-2 rounded-lg max-w-full" 
                    />
                  )}
                  <p className={`text-xs mt-1 ${msg.isSender ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(msg.time).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <label className="p-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                📎
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button 
                onClick={sendMessage}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {image && (
              <div className="mt-2 relative inline-block">
                <img 
                  src={image} 
                  alt="To be sent" 
                  className="h-20 rounded-lg" 
                />
                <button
                  onClick={() => setImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a chat to start messaging
        </div>
      )}
    </div>
  );
}