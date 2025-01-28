import React from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import LeftSidebar from '../components/LeftSidebar';
import Sidebar from '../components/Sidebar';

export default function PGA() {
  return (
    <>
      <Head>
        <title>PGA | YouBuidl</title>
        <meta name="description" content="Public Goods Alliance on YouBuidl" />
      </Head>
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        
        <div className="flex-1 pt-16">
          <div className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-100 overflow-y-auto no-scrollbar">
            <LeftSidebar />
          </div>

          <div className="w-full md:ml-64 md:mr-80">
            <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-gray-900">Public Goods Alliance</h1>
              <p className="mt-2 text-gray-600">Support and explore public goods initiatives.</p>
              
              {/* Add your PGA content here */}
              <div className="mt-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <p>Public Goods Alliance content coming soon...</p>
                </div>
              </div>
            </main>
          </div>

          <div className="hidden md:block fixed right-0 top-16 bottom-0 w-80 bg-white border-l border-gray-100 overflow-y-auto no-scrollbar">
            <Sidebar />
          </div>
        </div>
      </div>
    </>
  );
}