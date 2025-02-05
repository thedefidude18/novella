import React, { useState } from "react";
import Head from "next/head";
import Header from "../components/Header";
import LeftSidebar from "../components/LeftSidebar";
import Sidebar from "../components/Sidebar";

export default function AiAgents() {
  const [agentSrc, setAgentSrc] = useState("https://youbuildagent.netlify.app/");

  const openAgentWithAction = (action) => {
    setAgentSrc(`https://youbuildagent.netlify.app/?action=${action}`);
  };

  return (
    <>
      <Head>
        <title>AI Agents | YouBuidl</title>
        <meta name="description" content="Explore AI Agents on YouBuidl" />
      </Head>
      <div className="flex flex-col min-h-screen bg-white">
        <Header />

        <div className="flex-1 pt-16">
          <div className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-100 overflow-y-auto no-scrollbar">
            <LeftSidebar />
          </div>

          <div className="w-full md:ml-64 md:mr-80">
            <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            

             {/* EMBEDDED CHAT (FULLSCREEN + AUTO FIT) */}
        <div className="w-full h-[calc(100vh-4rem)] mt-16">
          <iframe
            id="agentFrame"
            src={agentSrc}
            className="w-full h-full border-none"
          ></iframe>
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
