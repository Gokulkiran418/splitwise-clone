import { useState, useEffect } from 'react';
import api from '../api';

function GroupForm({ onGroupAdded }) {
  const [name, setName] = useState('');
  const [userIds, setUserIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (err) {
        setError('Failed to load users');
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || userIds.length === 0) {
      setError('Name and at least one user are required');
      return;
    }
    try {
      const response = await api.post('/groups', { name, user_ids: userIds });
      onGroupAdded(response.data);
      setName('');
      setUserIds([]);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create group');
    }
  };

  const toggleUser = (userId) => {
    setUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-4">
      <h2 className="text-lg font-semibold mb-4">Create Group</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Group Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter group name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Select Users</label>
          <div className="mt-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={userIds.includes(user.id)}
                  onChange={() => toggleUser(user.id)}
                  className="mr-2"
                />
                <span>{user.name}</span>
              </div>
            ))}
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Group
        </button>
      </form>
    </div>
  );
}

export default GroupForm;