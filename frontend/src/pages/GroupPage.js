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
  <div className="flex flex-col md:flex-row p-4 space-y-4 md:space-y-0 md:space-x-4">
    {/* Left Panel: Select & Create */}
    <div className="flex-1 flex flex-col space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Select Group</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {groups.length > 0 ? (
          <select
            value={selectedGroupId || ''}
            onChange={e =>
              setSelectedGroupId(e.target.value ? parseInt(e.target.value) : null)
            }
            className="w-full p-2 border rounded"
          >
            <option value="">-- Choose a group --</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        ) : (
          <p>No groups available</p>
        )}
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Create Group</h2>
        <GroupForm onGroupAdded={fetchGroups} />
      </div>
    </div>

    {/* Right Panel: Expense & Balance */}
    <div className="flex-1 flex flex-col space-y-4">
      <div className="bg-white p-4 rounded shadow flex-1">
        {selectedGroupId ? (
          <ExpenseForm
            groupId={selectedGroupId}
            onExpenseAdded={() => setRefreshKey(k => k + 1)}
          />
        ) : (
          <p className="text-gray-500">Select a group to add expenses</p>
        )}
      </div>
      <div className="bg-white p-4 rounded shadow flex-1">
        {selectedGroupId ? (
          <BalanceView groupId={selectedGroupId} refreshKey={refreshKey} />
        ) : (
          <p className="text-gray-500">Select a group to view balances</p>
        )}
      </div>
    </div>
  </div>
);

}

export default GroupPage;
