import React, { useState, useEffect } from 'react';
import { initDb, addPoints, getUserPoints, getPointsHistory, getLeaderboard } from '../lib/db';

export default function TestDB() {
  const [testDid, setTestDid] = useState('test-user-123');
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    initDb()
      .then(() => loadData())
      .catch(error => setStatus('Error initializing DB: ' + error.message));
  }, []);

  const loadData = async () => {
    try {
      const userPoints = await getUserPoints(testDid);
      const pointsHistory = await getPointsHistory(testDid);
      const leaderboardData = await getLeaderboard();
      
      setPoints(userPoints);
      setHistory(pointsHistory);
      setLeaderboard(leaderboardData);
    } catch (error) {
      setStatus('Error loading data: ' + error.message);
    }
  };

  const handleAddPoints = async () => {
    try {
      setStatus('Adding points...');
      await addPoints(testDid, 10, 'Test points');
      await loadData();
      setStatus('Points added successfully');
    } catch (error) {
      setStatus('Error adding points: ' + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">IndexedDB Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test User</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={testDid}
            onChange={(e) => setTestDid(e.target.value)}
            className="border rounded px-3 py-2 w-64"
            placeholder="Enter test DID"
          />
          <button
            onClick={handleAddPoints}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add 10 Points
          </button>
        </div>
        <p className="text-lg">Current Points: <span className="font-bold">{points}</span></p>
        {status && <p className="text-sm text-gray-600 mt-2">{status}</p>}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Points History</h2>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Points Change</th>
                <th className="px-4 py-2 text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{new Date(record.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2">{record.points_change}</td>
                  <td className="px-4 py-2">{record.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Points</th>
                <th className="px-4 py-2 text-left">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{user.did}</td>
                  <td className="px-4 py-2">{user.points}</td>
                  <td className="px-4 py-2">
                    {new Date(user.updated_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}