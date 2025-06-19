import { useState, useEffect } from 'react';
import GroupForm from '../components/GroupForm';
import ExpenseForm from '../components/ExpenseForm';
import BalanceView from '../components/BalanceView';
import api from '../api';

function GroupPage() {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState('');

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load groups');
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="h-[calc(100vh-80px)] grid grid-cols-3 gap-4 p-4">
      {/* Left Column: Full-height Create Group */}
      <div className="col-span-1 overflow-y-auto bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Create Group</h2>
        <GroupForm onGroupAdded={fetchGroups} />
      </div>

      {/* Right Column: Select Group + Expense + Balance */}
      <div className="col-span-2 grid grid-rows-[auto_1fr_1fr] gap-4 h-full">
        {/* Top Row: Select Group */}
<div className="bg-white p-4 rounded-lg shadow-md overflow-y-auto">
  <h2 className="text-lg font-semibold mb-2">Select Group</h2>
  {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
  {groups.length > 0 ? (
    <select
      value={selectedGroupId || ''}
      onChange={(e) =>
        setSelectedGroupId(e.target.value ? parseInt(e.target.value) : null)
      }
      className="p-2 w-full border rounded-md"
    >
      <option value="">Select a group</option>
      {groups.map((group) => (
        <option key={group.id} value={group.id}>
          {group.name}
        </option>
      ))}
    </select>
  ) : (
    <p>No groups found</p>
  )}
  {selectedGroupId && (
    <p className="text-sm text-gray-500 mt-2">Scroll down to see balances.</p>
  )}
</div>

        {/* Middle Row: ExpenseForm */}
        <div className="bg-white p-4 rounded-lg shadow-md overflow-y-auto">
          {selectedGroupId ? (
            <ExpenseForm
              groupId={selectedGroupId}
              onExpenseAdded={() => setRefreshKey((prev) => prev + 1)}
            />
          ) : (
            <p className="text-gray-500 text-center">Select a group to add expenses</p>
          )}
        </div>

        {/* Bottom Row: BalanceView */}
        <div className="bg-white p-4 rounded-lg shadow-md overflow-y-auto">
          {selectedGroupId ? (
            <BalanceView groupId={selectedGroupId} refreshKey={refreshKey} />
          ) : (
            <p className="text-gray-500 text-center">Select a group to view balances</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupPage;
