import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserForm from '../components/UserForm';
import api from '../api';

function HomePage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Home</h1>
      <UserForm onUserAdded={fetchUsers} />
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Users</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {users.length > 0 ? (
          <ul>
            {users.map((user) => (
              <li key={user.id} className="mb-2">
                {user.name} (
                <Link to={`/users/${user.id}`} className="text-blue-600 hover:underline">
                  View Balances
                </Link>
                )
              </li>
            ))}
          </ul>
        ) : (
          <p>No users found</p>
        )}
      </div>
    </div>
  );
}

export default HomePage;