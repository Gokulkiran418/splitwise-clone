import { useState, useEffect } from 'react';
import GroupForm from '../components/GroupForm';
import ExpenseForm from '../components/ExpenseForm';
import BalanceView from '../components/BalanceView';
import api from '../api';

function GroupPage() {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
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
    <div>
      <h1 className="text-2xl font-bold mb-4">Groups</h1>
      <GroupForm onGroupAdded={fetchGroups} />
      <div className="bg-white p-6 rounded-lg shadow-md mb-4">
        <h2 className="text-lg font-semibold mb-4">Select Group</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {groups.length > 0 ? (
          <select
            value={selectedGroupId || ''}
            onChange={(e) => setSelectedGroupId(e.target.value ? parseInt(e.target.value) : null)}
            className="p-2 w-full border rounded-md"
          >
            <option value="">Select a group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        ) : (
          <p>No groups found</p>
        )}
      </div>
      {selectedGroupId && (
        <>
          <ExpenseForm groupId={selectedGroupId} onExpenseAdded={() => {}} />
          <BalanceView groupId={selectedGroupId} />
        </>
      )}
    </div>
  );
}

export default GroupPage;