import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY);

interface Chat {
  id: string;
  name: string;
  image: string;
  lastMessage?: string;
  time?: string;
  unread?: number;
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

interface DynamicMessagePanelProps {
  currentUserId: string;
  connectionId: string;
  onBack: () => void;
}

export default function DynamicMessagePanel({ currentUserId }: DynamicMessagePanelProps) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);

  // Fetch connected users from Supabase
  useEffect(() => {
    const fetchChats = async () => {
      const { data, error } = await supabase
        .from('connections') // Ensure this table exists
        .select('id, name, image, online')
        .eq('user_id', currentUserId);

      if (error) {
        console.error('Error fetching chats:', error);
      } else {
        setChats(data);
      }
    };

    fetchChats();
  }, []);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('time', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  // Listen for real-time messages
  useEffect(() => {
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Send message
  const sendMessage = async () => {
    if (!selectedChat || (!message.trim() && !image)) return;

    const newMessage = {
      sender_id: currentUserId,
      receiver_id: selectedChat.id,
      content: message,
      image,
      time: new Date().toISOString(),
    };

    const { error } = await supabase.from('messages').insert([newMessage]);

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setMessages((prev) => [...prev, newMessage as Message]);
    }

    setMessage('');
    setImage(null);
  };

  // Handle file selection
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
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b flex items-center space-x-4">
            <img src={selectedChat.image} alt={selectedChat.name} className="w-10 h-10 rounded-full object-cover" />
            <h3 className="font-medium">{selectedChat.name}</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-lg p-3 ${msg.sender_id === currentUserId ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  <p>{msg.content}</p>
                  {msg.image && <img src={msg.image} alt="Attachment" className="mt-2 rounded-lg max-w-full" />}
                  <p className="text-xs mt-1 text-gray-500">{new Date(msg.time).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <label className="p-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                📎
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">Select a chat to start messaging</div>
      )}
    </div>
  );
}
