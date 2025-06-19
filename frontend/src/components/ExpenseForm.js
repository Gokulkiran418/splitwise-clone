import { useState, useEffect } from 'react';
import api from '../api';

function ExpenseForm({ groupId, onExpenseAdded }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [splits, setSplits] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await api.get(`/groups/${groupId}`);
        const groupUsers = response.data.users;
        setUsers(groupUsers);
        setSplits(groupUsers.map((user) => ({
          user_id: user.id,
          percentage: splitType === 'percentage' ? 0 : null,
        })));
      } catch (err) {
        setError('Failed to load group users');
      }
    };
    fetchGroup();
  }, [groupId, splitType]);

  const handlePercentageChange = (userId, value) => {
    setSplits((prev) =>
      prev.map((split) =>
        split.user_id === userId ? { ...split, percentage: parseFloat(value) || 0 } : split
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !amount || !paidBy || amount <= 0) {
      setError('All fields are required, and amount must be positive');
      return;
    }
    if (splitType === 'percentage') {
      const totalPercentage = splits.reduce((sum, split) => sum + (split.percentage || 0), 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        setError('Percentages must sum to 100%');
        return;
      }
    }
    try {
      const expenseData = {
        description,
        amount: parseFloat(amount),
        paid_by: parseInt(paidBy),
        split_type: splitType,
        splits: splits.map((split) => ({
          user_id: split.user_id,
          percentage: splitType === 'percentage' ? split.percentage : null,
        })),
      };
      await api.post(`/groups/${groupId}/expenses`, expenseData);
      onExpenseAdded();
      setDescription('');
      setAmount('');
      setPaidBy('');
      setSplitType('equal');
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add expense');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-4">
      <h2 className="text-lg font-semibold mb-4">Add Expense</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter expense description"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter amount"
            min="0"
            step="0.01"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Paid By</label>
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md"
          >
            <option value="">Select payer</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Split Type</label>
          <select
            value={splitType}
            onChange={(e) => setSplitType(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md"
          >
            <option value="equal">Equal</option>
            <option value="percentage">Percentage</option>
          </select>
        </div>
        {splitType === 'percentage' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Percentages</label>
            {splits.map((split) => {
              const user = users.find((u) => u.id === split.user_id);
              return (
                <div key={split.user_id} className="flex items-center mb-2">
                  <span className="mr-2 w-32">{user?.name}</span>
                  <input
                    type="number"
                    value={split.percentage || ''}
                    onChange={(e) => handlePercentageChange(split.user_id, e.target.value)}
                    className="p-2 w-24 border rounded-md"
                    placeholder="%"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <span className="ml-2">%</span>
                </div>
              );
            })}
          </div>
        )}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
}

export default ExpenseForm;