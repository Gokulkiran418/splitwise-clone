import { useState, useEffect } from 'react';
import api from '../api';

function Chatbot({ refreshUsers }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      const fetchedUsers = response.data || [];
      setUsers(fetchedUsers);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };
  fetchUsers();
}, [refreshUsers]);

// Validate selectedUserId only when users change
useEffect(() => {
  if (selectedUserId && !users.some(u => u.id === selectedUserId)) {
    setSelectedUserId(null);
    setMessages([]);
  }
}, [users, selectedUserId]);
  const toggleChat = () => setIsOpen(!isOpen);

  const selectUser = (userId) => {
    setSelectedUserId(userId);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedUserId) return;
    const query = input;
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setInput('');
    setLoading(true);
    try {
      const response = await api.post('/chat', {
        query,
        current_user_id: selectedUserId
      });
      setMessages(prev => [...prev, { role: 'bot', content: response.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I encountered an error: ' + (err.response?.data?.detail || 'Unknown error') }]);
    }
    setLoading(false);
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition"
        >
          Chat with AI
        </button>
      )}
      {isOpen && (
        <div className="w-80 h-[400px] bg-white rounded-lg shadow-xl flex flex-col">
          <div className="flex justify-between items-center p-3 bg-blue-500 text-white rounded-t-lg">
            <h3 className="text-lg font-semibold">AI Chatbot</h3>
            <button onClick={toggleChat} className="text-xl">×</button>
          </div>
          <div className="p-3">
            <select
              value={selectedUserId || ''}
              onChange={e => selectUser(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select User --</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 p-3 overflow-y-auto">
            {messages.length === 0 && (
              <p className="text-gray-500 text-center">Ask about balances, expenses, or top payers!</p>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <span
                  className={`inline-block p-2 rounded-lg ${
                    msg.role === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </span>
              </div>
            ))}
            {loading && <div className="text-gray-500 text-center">Thinking...</div>}
          </div>
          <div className="p-3 border-t flex">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., How much does Alice owe?"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
