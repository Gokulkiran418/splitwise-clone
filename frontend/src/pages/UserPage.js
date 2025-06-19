import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

function UserPage() {
  const { userId } = useParams();
  const [balances, setBalances] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const response = await api.get(`/users/${userId}/balances`);
        setBalances(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load balances');
      }
    };
    fetchBalances();
  }, [userId]);

  if (!balances) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Balances for {balances.name}</h1>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Group Balances</h2>
        {balances.balances.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">Group</th>
                <th className="p-2 text-left">Net Balance</th>
              </tr>
            </thead>
            <tbody>
              {balances.balances.map((balance, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">{balance.group_name}</td>
                  <td className="p-2">
                    {balance.net_balance >= 0 ? (
                      <span className="text-green-600">+${balance.net_balance.toFixed(2)}</span>
                    ) : (
                      <span className="text-red-600">-${Math.abs(balance.net_balance).toFixed(2)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No balances found</p>
        )}
      </div>
    </div>
  );
}

export default UserPage;