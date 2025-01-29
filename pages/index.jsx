import React, { useRef } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import LeftSidebar from '../components/LeftSidebar';
import Feed from '../components/Feed';
import { useOrbis } from '@orbisclub/components';
import Editor from '../components/Editor';

export default function Home() {
  const { user, setConnectModalVis } = useOrbis();
  const refreshFeedRef = useRef(null);

  const handlePostCreated = async () => {
    if (refreshFeedRef.current) {
      await refreshFeedRef.current(); // Call the refresh function in Feed
    }
  };

  return (
    <>
      <Head>
        <title>YouBuidl | Connect, fund and explore Public Goods.</title>
        <meta
          property="og:title"
          content="Welcome to youbuidl - A web3 builder community for Public Goods!"
        />
        <meta name="description" content="Welcome to youbuidl" />
        <meta
          property="og:description"
          content="A web3 builder community for Public Goods!"
        />
        <link rel="icon" href="/favicon.png" />
      </Head>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-dark-primary">
        <Header />
      </div>

      {/* Main Layout */}
      <div className="flex min-h-screen bg-white dark:bg-dark-primary pt-16">
        {/* Left Sidebar */}
        <div className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-dark-primary border-r border-gray-100 dark:border-dark-border overflow-y-auto">
          <LeftSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full md:ml-64 md:mr-80">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {/* Editor Section */}
            <div className="mb-8">
              {user ? (
                <Editor onPostCreated={handlePostCreated} />
              ) : (
                <div className="w-full text-center bg-gray-50 dark:bg-dark-secondary rounded-lg border border-gray-100 dark:border-dark-border p-6">
                  <p className="text-base text-gray-600 dark:text-dark-secondary mb-2">
                    Connect your wallet to share posts
                  </p>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                    onClick={() => setConnectModalVis(true)}
                  >
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>

            {/* Feed Section */}
            <div className="space-y-6">
              <Feed
                onRefresh={(refreshFunc) => {
                  refreshFeedRef.current = refreshFunc;
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden md:block fixed right-0 top-16 bottom-0 w-84 bg-white dark:bg-dark-primary border-l border-gray-80 dark:border-dark-border overflow-y-auto">
          <Sidebar />
        </div>
      </div>
    </>
  );
}