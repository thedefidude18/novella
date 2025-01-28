import React, { useContext } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Editor from "../components/Editor";
import Header from '../components/Header';
import Hero from '../components/Hero';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useOrbis, User } from "@orbisclub/components";
import { GlobalContext } from "../contexts/GlobalContext";

export default function Create() {
  const { orbis, user, setConnectModalVis } = useOrbis();

  return (
    <>
      <Head>
        {/** Title */}
        <title key="title">what are you Building | Share a new post.</title>
        <meta property="og:title" content="Share what you are building." key="og_title" />

        {/** Description */}
        <meta name="description" content="Discuss the future public goods." key="description"></meta>
        <meta property="og:description" content="Discuss the future public goods." key="og_description"/>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip bg-main">
        <div className="antialiased">
          <div className="min-h-screen flex">

            {/*  Page content */}
            <main className="grow overflow-hidden">
              {/*  Site header */}
              <Header />
              <Hero title="Share what you are buiding" description="You are about to share a new post in the forum. Make sure to read our rules before doing so." image />

              {/* Page content */}
              <section>
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                  <div className="md:flex md:justify-between">

                    {/* Show post editor or connect button */}
                    <div className="md:grow pt-0 pb-12 pr-10">
                      {user ?
                        <Editor />
                      :
                        <div className="w-full text-center bg-slate-50 rounded border border-primary bg-secondary p-6">
                          <p className="text-base text-secondary mb-2">You must be connected to share a post.</p>
                          <button className="btn-sm py-1.5 btn-main" onClick={() => setConnectModalVis(true)}>Connect</button>
                        </div>
                      }
                    </div>
                    <Sidebar />
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>

        {/*  Site footer */}
        <Footer />
      </div>
    </>
  );
}
