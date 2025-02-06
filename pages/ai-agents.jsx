import React, { useState } from "react";
import Head from "next/head";
import Header from "../components/Header";
import LeftSidebar from "../components/LeftSidebar";
import Sidebar from "../components/Sidebar";

export default function AiAgents() {
  const [agentSrc, setAgentSrc] = useState("https://youbuildagent.netlify.app/");

  return (
    <>
      <Head>
        <meta name="description" content="Explore AI Agents on YouBuidl" />
      </Head>

      <div className="flex flex-col min-h-screen bg-white">
        <Header />

        {/* MAIN CONTENT CONTAINER */}
        <div className="flex pt-16">
          {/* LEFT SIDEBAR */}
          <div className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-100 overflow-y-auto no-scrollbar">
            <LeftSidebar />
          </div>

          {/* IFRAME CONTAINER (CENTERED) */}
          <div className="flex-1 flex justify-center items-center px-4 md:ml-64 md:mr-80">
            <iframe
              id="agentFrame"
              src={agentSrc}
              className="w-full max-w-[920px] h-[calc(100vh-4rem)] border-none rounded-lg shadow"
            ></iframe>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="hidden md:block fixed right-0 top-16 bottom-0 w-80 bg-white border-l border-gray-100 overflow-y-auto no-scrollbar">
            <Sidebar />
          </div>
        </div>
      </div>
    </>
  );
}
