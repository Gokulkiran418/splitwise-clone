import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Chatbot from '../components/Chatbot';

function UserForm({ onUserAdded }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    try {
      const response = await api.post('/users', { name });
      setName('');
      setError('');
      onUserAdded(response.data);
    } catch (err) {
      setError('Failed to add user: ' + (err.response?.data?.detail || 'Unknown error'));
      console.error('Add user error:', err);
    }
  };
  

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3">Add User</h3>
      {error && <p className="text-red-500 mb-3">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter user name"
          className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Add User
        </button>
      </form>
    </div>
  );
}

function HomePage() {
  const [users, setUsers] = useState([]);
  const [refreshUsers, setRefreshUsers] = useState(0);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [refreshUsers]);

  const handleUserAdded = (newUser) => {
    setUsers((prev) => [...prev, newUser]);
    setRefreshUsers((prev) => prev + 1);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      <div className="space-y-6">
        <UserForm onUserAdded={handleUserAdded} />
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-3">User List</h3>
          {users.length > 0 ? (
            <ul className="list-disc pl-5">
              {users.map((user) => (
                <li key={user.id} className="text-gray-800">
                  {user.name} -{' '}
                  <Link
                    to={`/users/${user.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    View Balance
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No users available</p>
          )}
        </div>
      </div>
      <Chatbot refreshUsers={refreshUsers} />
    </div>
  );
}

export default HomePage;
