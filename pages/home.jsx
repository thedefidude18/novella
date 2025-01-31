import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import LeftSidebar from '../components/LeftSidebar';
import Sidebar from '../components/Sidebar';
import { useOrbis } from "@orbisclub/components";
import Link from 'next/link';
import Image from 'next/image';

export default function Projects() {
  const { orbis } = useOrbis();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    let { data, error } = await orbis.getPosts({ 
      context: global.orbis_context,
      tag: 'category:projects'
    });
    
    if(data) {
      setProjects(data);
    }
    setLoading(false);
  }

  return (
    <>
      <Head>
        <title>Projects | YouBuidl</title>
        <meta name="description" content="Explore and discover amazing projects on YouBuidl" />
      </Head>
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        
        <div className="flex-1 pt-16">
          <div className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-100 overflow-y-auto no-scrollbar">
            <LeftSidebar />
          </div>

          <div className="w-full md:ml-64 md:mr-80">
            <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                  <p className="mt-2 text-gray-600">Discover and support innovative projects in the ecosystem</p>
                </div>
                <Link 
                  href="/create" 
                  className="btn-sm py-2 px-4 bg-[var(--brand-color)] text-white rounded-lg hover:bg-[var(--brand-color-hover)]"
                >
                  Submit Project
                </Link>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-color)]"></div>
                </div>
              ) : (
                <div className="grid gap-6">
                  {projects.map((project) => (
                    <Link 
                      href={`/post/${project.stream_id}`}
                      key={project.stream_id}
                      className="block bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                              {project.content.title}
                            </h2>
                            <p className="text-gray-600 line-clamp-2 mb-4">
                              {project.content.body}
                            </p>
                            
                            {project.content.projectDetails && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">Funding Goal</p>
                                  <p className="font-medium">{project.content.projectDetails.fundingGoal} ETH</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Stage</p>
                                  <p className="font-medium capitalize">{project.content.projectDetails.stage}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Team Size</p>
                                  <p className="font-medium">{project.content.projectDetails.teamSize} members</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Deadline</p>
                                  <p className="font-medium">
                                    {new Date(project.content.projectDetails.deadline).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {project.content.media && project.content.media[0] && (
                            <div className="ml-6 flex-shrink-0">
                              <image
                                src={project.content.media[0].url}
                                alt={project.content.title}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="inline-block bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                              {project.content.projectDetails?.stage || 'Project'}
                            </span>
                            <span className="mx-2">•</span>
                            <span>
                              {project.count_likes || 0} likes
                            </span>
                            <span className="mx-2">•</span>
                            <span>
                              {project.count_replies || 0} comments
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}

                  {projects.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">No projects have been submitted yet.</p>
                      <Link 
                        href="/create" 
                        className="inline-block mt-4 text-[var(--brand-color)] hover:underline"
                      >
                        Submit the first project
                      </Link>
                    </div>
                  )}
                </div>
              )}
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