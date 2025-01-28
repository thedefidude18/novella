import React, { useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import LeftSidebar from '../components/LeftSidebar';
import Sidebar from '../components/Sidebar';
import Script from 'next/script';

export default function Trade() {
  useEffect(() => {
    const loadWidget = async () => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@okx/dex-widget@latest/dist/index.umd.js';
      script.async = true;
      script.onload = () => {
        if (window.OKXDexWidget) {
          new window.OKXDexWidget({
            elementId: 'okx-widget-container',
            network: 1,
            width: '100%',
            height: '600px'
          });
        }
      };
      document.body.appendChild(script);
    };

    loadWidget();

    return () => {
      const script = document.querySelector('script[src="https://unpkg.com/@okx/dex-widget@latest/dist/index.umd.js"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>Trade | YouBuidl</title>
        <meta name="description" content="Trade assets on YouBuidl" />
      </Head>

      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        
        <div className="flex-1 pt-16">
          <div className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-100 overflow-y-auto no-scrollbar">
            <LeftSidebar />
          </div>

          <div className="w-full md:ml-64 md:mr-80">
            <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Trade</h1>
              
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div id="okx-widget-container" />
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