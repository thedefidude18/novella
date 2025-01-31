import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useOrbis, User } from '@orbisclub/components';
import { FaGithub, FaTwitter, FaDiscord, FaLinkedin, FaTrophy } from 'react-icons/fa';

export default function LeftSidebar() {
  const { user } = useOrbis();
  const router = useRouter();

  const isActivePath = (path) => router.pathname === path;

  const menuItems = [
    
    {
      name: 'Public Goods AI',
      path: '/ai-agents',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      ),
      color: 'text-indigo-500',
    },
    {
      name: 'Extensions',
      path: '/pga',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
        </svg>
      ),
      color: 'text-yellow-500',
    },
    {
      name: 'Leaderboard',
      path: '/leaderboard',
      icon: <FaTrophy className="w-5 h-5" />,
      color: 'text-yellow-500',
    },
  ];

  const resourceItems = [
    {
      name: 'Documentation',
      path: '/docs',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      ),
      color: 'text-cyan-500',
    },
    {
      name: 'Partnership',
      path: '/partnership',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      ),
      color: 'text-teal-500',
    },
    {
      name: 'About Us',
      path: '/about',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: 'text-pink-500',
    },
  ];

  const socialItems = [
    {
      name: 'Github',
      path: 'https://github.com/',
      icon: <FaGithub size={24} />,
      color: 'text-gray-800 dark:text-gray-200',
    },
    {
      name: 'Twitter',
      path: 'https://twitter.com/',
      icon: <FaTwitter size={24} />,
      color: 'text-blue-400',
    },
    {
      name: 'Discord',
      path: 'https://discord.com/',
      icon: <FaDiscord size={24} />,
      color: 'text-indigo-600',
    },
  ];

  return (
    <div className="h-full p-4 bg-white dark:bg-dark-primary">
      <nav className="space-y-8">
        {/* Main Menu */}
        <div>
          <div className="px-3 mb-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-dark-secondary uppercase tracking-wider">
              Main Menu
            </h3>
          </div>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActivePath(item.path)
                    ? 'bg-gray-50 dark:bg-dark-secondary'
                    : 'hover:bg-gray-50 dark:hover:bg-dark-secondary'
                } group`}
              >
                <span className={`${item.color} group-hover:text-opacity-80`}>
                  {item.icon}
                </span>
                <span
                  className={`ml-3 ${
                    isActivePath(item.path)
                      ? 'text-gray-900 dark:text-dark-primary'
                      : 'text-gray-600 dark:text-dark-secondary'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Resources Section */}
        <div>
          <div className="px-3 mb-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-dark-secondary uppercase tracking-wider">
              Resources
            </h3>
          </div>
          <div className="space-y-1">
            {resourceItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActivePath(item.path)
                    ? 'bg-gray-50 dark:bg-dark-secondary'
                    : 'hover:bg-gray-50 dark:hover:bg-dark-secondary'
                } group`}
              >
                <span className={`${item.color} group-hover:text-opacity-80`}>
                  {item.icon}
                </span>
                <span
                  className={`ml-3 ${
                    isActivePath(item.path)
                      ? 'text-gray-900 dark:text-dark-primary'
                      : 'text-gray-600 dark:text-dark-secondary'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Socials Section */}
        <div>
          <div className="px-3 mb-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-dark-secondary uppercase tracking-wider">
              Socials
            </h3>
          </div>
          <div className="flex space-x-4">
            {socialItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-dark-secondary group"
              >
                <span className={`${item.color} group-hover:text-opacity-80`}>
                  {item.icon}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* User Profile */}
        {user && (
          <div className="px-3 mt-auto">
            <div className="flex items-center p-3 bg-gray-50 dark:bg-dark-secondary rounded-lg">
              <User details={user} height={32} />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-dark-primary">
                  {user?.details?.profile?.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-secondary">
                  {user?.details?.metadata?.email || ''}
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}