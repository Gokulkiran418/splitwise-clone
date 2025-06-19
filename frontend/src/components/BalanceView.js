import { useState, useEffect } from 'react';
import api from '../api';

function BalanceView({ groupId }) {
  const [balances, setBalances] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const response = await api.get(`/groups/${groupId}/balances`);
        setBalances(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load balances');
      }
    };
    fetchBalances();
  }, [groupId]);

  if (!balances) return <p>Loading...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Group Balances: {balances.name}</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <h3 className="text-md font-medium mb-2">Individual Balances</h3>
      <table className="w-full mb-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">User</th>
            <th className="p-2 text-left">Net Balance</th>
          </tr>
        </thead>
        <tbody>
          {balances.balances.map((balance) => (
            <tr key={balance.user_id} className="border-t">
              <td className="p-2">{balance.name}</td>
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
      <h3 className="text-md font-medium mb-2">Settlements</h3>
      {balances.settlements.length > 0 ? (
        <ul>
          {balances.settlements.map((settlement, index) => (
            <li key={index} className="mb-2">
              {settlement.from_user_name} owes {settlement.to_user_name} ${settlement.amount.toFixed(2)}
            </li>
          ))}
        </ul>
      ) : (
        <p>No settlements needed</p>
      )}
    </div>
  );
}

export default BalanceView;