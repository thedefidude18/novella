import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useOrbis, User } from '@orbisclub/components';
import { LoadingCircle } from './Icons';
import ReactTimeAgo from 'react-time-ago';
import { getIpfsLink } from '../utils';
import { FaEthereum, FaHeart, FaComment } from 'react-icons/fa';
import DonateButton from './DonateButton';

function Sidebar() {
  return (
    <aside className="md:w-64 lg:w-80 md:shrink-0 pt-6 pb-12 md:pb-20">
      <div className="md:pl-6 lg:pl-10">
        <div className="space-y-8">
          <TopProjects />
          <RecentDiscussions />
          <UpcomingEvents />
        </div>
      </div>
    </aside>
  );
}

const TopProjects = () => {
  const { orbis } = useOrbis();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    try {
      const { data } = await orbis.getPosts({
        context: global.orbis_context,
        only_master: true,
        tag: 'category:projects',
        order_by: 'count_likes'
      }, 0, 3);

      if (data) {
        const projectsWithDonations = await Promise.all(data.map(async (project) => {
          const donations = await loadProjectDonations(project.stream_id);
          return { ...project, donations };
        }));
        setProjects(projectsWithDonations);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadProjectDonations(streamId) {
    try {
      const { data: donations } = await orbis.getPosts({
        context: streamId,
        tag: 'donation'
      });

      return donations?.reduce((acc, donation) => {
        if (donation.content?.data?.type === 'donation') {
          const amount = parseFloat(donation.content.data.amount) || 0;
          const token = donation.content.data.token || 'ETH';
          acc[token] = (acc[token] || 0) + amount;
        }
        return acc;
      }, { ETH: 0 }) || { ETH: 0 };
    } catch (error) {
      console.error('Error loading donations:', error);
      return { ETH: 0 };
    }
  }

  const formatDonation = (amount) => parseFloat(amount).toFixed(4);

  return (
    <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-sm border border-gray-200 dark:border-dark-border p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-primary mb-4">
        Top Projects
      </h3>
      
      {loading ? (
        <div className="flex justify-center p-4">
          <LoadingCircle />
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.stream_id} className="group">
              <Link href={'/post/' + project.stream_id}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-tertiary">
                    {project.content?.media?.[0] ? (
                      <img
                        src={getIpfsLink(project.content.media[0])}
                        alt={project.content.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaEthereum className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-dark-primary truncate group-hover:text-[var(--brand-color)]">
                      {project.content.title}
                    </p>
                    
                    <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500 dark:text-dark-secondary">
                      <span className="flex items-center">
                        <FaHeart className="w-3 h-3 mr-1" />
                        {project.count_likes || 0}
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <FaComment className="w-3 h-3 mr-1" />
                        {project.count_replies || 0}
                      </span>
                      {Object.entries(project.donations).map(([token, amount]) => 
                        amount > 0 && (
                          <React.Fragment key={token}>
                            <span>•</span>
                            <span className="flex items-center text-green-600">
                              <FaEthereum className="w-3 h-3 mr-1" />
                              {formatDonation(amount)} {token}
                            </span>
                          </React.Fragment>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </Link>
              <div className="mt-2">
                <DonateButton post={project} />
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-dark-secondary">
                No projects found
              </p>
              <Link 
                href="/create" 
                className="text-sm text-[var(--brand-color)] hover:underline mt-2 inline-block"
              >
                Create the first project →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const RecentDiscussions = () => {
  const { orbis } = useOrbis();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const { data } = await orbis.getPosts({
        context: global.orbis_context,
        only_master: true,
        order_by: 'last_reply_timestamp'
      }, 0, 5);
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading discussions:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-sm border border-gray-200 dark:border-dark-border p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-primary mb-4">
        Recent Discussions
      </h3>

      {loading ? (
        <div className="flex justify-center p-4">
          <LoadingCircle />
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link 
              key={post.stream_id} 
              href={'/post/' + post.stream_id}
              className="block group"
            >
              <div className="flex items-start space-x-3">
                <User details={post.creator_details} height={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-primary truncate group-hover:text-[var(--brand-color)]">
                    {post.content.title}
                  </p>
                  <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500 dark:text-dark-secondary">
                    <ReactTimeAgo date={post.timestamp * 1000} locale="en-US" />
                    <span>•</span>
                    <span className="flex items-center">
                      <FaHeart className="w-3 h-3 mr-1" />
                      {post.count_likes || 0}
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <FaComment className="w-3 h-3 mr-1" />
                      {post.count_replies || 0}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-dark-secondary">
                No discussions yet
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const UpcomingEvents = () => {
  const events = [
    {
      id: 1,
      title: 'Web3 Builders Meetup',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      location: 'Virtual',
      type: 'Community Call'
    },
    {
      id: 2,
      title: 'DeFi Development Workshop',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: 'Virtual',
      type: 'Workshop'
    },
    {
      id: 3,
      title: 'Public Goods Hackathon',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      location: 'Global',
      type: 'Hackathon'
    }
  ];

  return (
    <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-sm border border-gray-200 dark:border-dark-border p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-primary mb-4">
        Upcoming Events
      </h3>

      <div className="space-y-4">
        {events.map((event) => (
          <div 
            key={event.id}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--brand-color)] bg-opacity-10 flex items-center justify-center">
              {event.type === 'Community Call' ? (
                <svg className="w-5 h-5 text-[var(--brand-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ) : event.type === 'Workshop' ? (
                <svg className="w-5 h-5 text-[var(--brand-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-[var(--brand-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-dark-primary">
                {event.title}
              </p>
              <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-dark-secondary">
                <ReactTimeAgo date={event.date} locale="en-US" timeStyle="round" />
                <span className="mx-1">•</span>
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;