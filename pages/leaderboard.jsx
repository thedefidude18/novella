import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useOrbis, User, UserPopup } from "@orbisclub/components";
import Header from '../components/Header';
import LeftSidebar from '../components/LeftSidebar';
import Sidebar from '../components/Sidebar';
import { FaTrophy, FaHeart, FaComment, FaEthereum, FaUsers } from 'react-icons/fa';

export default function Leaderboard() {
  const { orbis } = useOrbis();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [showUserPopup, setShowUserPopup] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedTimeframe]);

  async function loadLeaderboard() {
    setLoading(true);
    try {
      const { data: posts } = await orbis.getPosts({
        context: global.orbis_context
      });

      const userStats = new Map();

      for (const post of posts) {
        const userId = post.creator_details?.did;
        if (!userId) continue;

        if (!userStats.has(userId)) {
          userStats.set(userId, {
            did: userId,
            details: post.creator_details,
            posts: 0,
            likes: 0,
            comments: 0,
            donations: 0,
            points: post.creator_details?.profile?.metadata?.points || 0,
            followers: 0
          });
        }

        const stats = userStats.get(userId);
        stats.posts++;
        stats.likes += post.count_likes || 0;
        stats.comments += post.count_replies || 0;
      }

      for (const [userId, stats] of userStats) {
        const followersRes = await orbis.api.from("orbis_connections")
          .select()
          .eq('following_profile', userId)
          .eq('active', true);
        
        stats.followers = followersRes.data?.length || 0;
      }

      const rankedUsers = Array.from(userStats.values())
        .sort((a, b) => {
          const scoreA = calculateScore(a);
          const scoreB = calculateScore(b);
          return scoreB - scoreA;
        });

      setUsers(rankedUsers);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  function calculateScore(user) {
    return (
      user.points * 10 +
      user.posts * 50 +
      user.likes * 5 +
      user.comments * 10 +
      user.followers * 20 +
      user.donations * 100
    );
  }

  const timeframes = [
    { id: 'all', label: 'All Time' },
    { id: 'month', label: 'This Month' },
    { id: 'week', label: 'This Week' }
  ];

  return (
    <>
      <Head>
        <title>Leaderboard | YouBuidl</title>
        <meta name="description" content="See the top contributors and builders in the YouBuidl community" />
      </Head>

      <div className="flex flex-col min-h-screen bg-white dark:bg-dark-primary">
        <Header />
        
        <div className="flex-1 pt-16">
          {/* Left Sidebar - Hidden on mobile */}
          <div className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-dark-primary border-r border-gray-100 dark:border-dark-border overflow-y-auto">
            <LeftSidebar />
          </div>

          {/* Main Content */}
          <div className="w-full md:ml-64 md:mr-80 min-h-screen">
            <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-primary">
                    Community Leaderboard
                  </h1>
                  <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-dark-secondary">
                    Recognizing our top contributors and builders
                  </p>
                </div>

                {/* Timeframe Filters - Scrollable on mobile */}
                <div className="w-full sm:w-auto overflow-x-auto">
                  <div className="flex space-x-2 min-w-max">
                    {timeframes.map((timeframe) => (
                      <button
                        key={timeframe.id}
                        onClick={() => setSelectedTimeframe(timeframe.id)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${
                          selectedTimeframe === timeframe.id
                            ? 'bg-[var(--brand-color)] text-white'
                            : 'bg-gray-100 dark:bg-dark-secondary text-gray-700 dark:text-dark-secondary hover:bg-gray-200 dark:hover:bg-dark-tertiary'
                        }`}
                      >
                        {timeframe.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-color)]"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* User Cards */}
                  {users.map((user, index) => (
                    <div
                      key={user.did}
                      className="bg-white dark:bg-dark-secondary rounded-lg border border-gray-200 dark:border-dark-border p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Rank & Avatar */}
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {index < 3 ? (
                              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                                index === 0 ? 'bg-yellow-100 text-yellow-600' :
                                index === 1 ? 'bg-gray-100 text-gray-600' :
                                'bg-orange-100 text-orange-600'
                              }`}>
                                <FaTrophy />
                              </div>
                            ) : (
                              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 dark:bg-dark-tertiary text-gray-500 dark:text-dark-secondary">
                                #{index + 1}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => setShowUserPopup(user.did)}
                            className="flex items-center space-x-2 text-gray-900 dark:text-dark-primary hover:underline"
                          >
                            <User details={user.details} />
                          </button>
                        </div>

                        {/* Stats */}
                        <div className="flex-1 w-full sm:w-auto">
                          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-dark-secondary">
                            <span className="flex items-center">
                              <FaTrophy className="w-4 h-4 mr-1 text-yellow-500" />
                              {user.points}
                            </span>
                            <span className="flex items-center">
                              <FaHeart className="w-4 h-4 mr-1 text-red-500" />
                              {user.likes}
                            </span>
                            <span className="flex items-center">
                              <FaComment className="w-4 h-4 mr-1 text-blue-500" />
                              {user.comments}
                            </span>
                            <span className="flex items-center">
                              <FaUsers className="w-4 h-4 mr-1 text-green-500" />
                              {user.followers}
                            </span>
                            <span className="flex items-center">
                              <FaEthereum className="w-4 h-4 mr-1 text-purple-500" />
                              {user.donations}
                            </span>
                          </div>
                        </div>

                        {/* Total Score */}
                        <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-dark-primary ml-auto">
                          {calculateScore(user)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Empty State */}
                  {users.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 dark:bg-dark-secondary rounded-lg">
                      <p className="text-gray-600 dark:text-dark-secondary">
                        No users found for the selected timeframe.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>

          {/* Right Sidebar - Hidden on mobile */}
          <div className="hidden md:block fixed right-0 top-16 bottom-0 w-80 bg-white dark:bg-dark-primary border-l border-gray-100 dark:border-dark-border overflow-y-auto">
            <Sidebar />
          </div>
        </div>
      </div>

      {/* User Profile Popup */}
      {showUserPopup && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="relative inline-block align-bottom bg-white dark:bg-dark-secondary rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <button
                onClick={() => setShowUserPopup(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:text-dark-secondary dark:hover:text-dark-primary"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <UserPopup did={showUserPopup} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}