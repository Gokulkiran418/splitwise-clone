import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GroupPage from './pages/GroupPage';
import UserPage from './pages/UserPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between">
            <Link to="/" className="text-xl font-bold">Splitwise Clone</Link>
            <div>
              <Link to="/" className="mr-4">Home</Link>
              <Link to="/groups">Groups</Link>
            </div>
          </div>
        </nav>
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/groups" element={<GroupPage />} />
            <Route path="/users/:userId" element={<UserPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;