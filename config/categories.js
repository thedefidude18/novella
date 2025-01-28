// Define categories and their properties
export const CATEGORIES = {
  'projects': {
    label: 'Projects',
    enableDonation: true,
    description: 'Share your project with the community'
  },
  'public-goods': {
    label: 'Public Goods',
    enableDonation: true,
    description: 'Public goods and infrastructure projects'
  },
  'dapps': {
    label: 'dApps',
    enableDonation: true,
    description: 'Decentralized applications'
  },
  'events': {
    label: 'Events',
    enableDonation: false,
    description: 'Community events and meetups'
  },
  'research': {
    label: 'Research',
    enableDonation: true,
    description: 'Research and development'
  },
  'governance': {
    label: 'Governance',
    enableDonation: false,
    description: 'Governance proposals and discussions'
  },
  'tutorials': {
    label: 'Tutorials',
    enableDonation: false,
    description: 'Educational content and guides'
  },
  'announcements': {
    label: 'Announcements',
    enableDonation: false,
    description: 'Important updates and announcements'
  },
  'discussions': {
    label: 'Discussions',
    enableDonation: false,
    description: 'General discussions'
  },
  'nfts': {
    label: 'NFTs',
    enableDonation: true,
    description: 'NFT projects and discussions'
  },
  'defi': {
    label: 'DeFi',
    enableDonation: true,
    description: 'Decentralized finance projects'
  },
  'dao': {
    label: 'DAO',
    enableDonation: true,
    description: 'Decentralized autonomous organizations'
  },
  'gaming': {
    label: 'Gaming',
    enableDonation: true,
    description: 'Web3 gaming projects'
  },
  'metaverse': {
    label: 'Metaverse',
    enableDonation: true,
    description: 'Metaverse projects and initiatives'
  },
  'infrastructure': {
    label: 'Infrastructure',
    enableDonation: true,
    description: 'Web3 infrastructure projects'
  },
  'security': {
    label: 'Security',
    enableDonation: false,
    description: 'Security discussions and updates'
  },
  'privacy': {
    label: 'Privacy',
    enableDonation: false,
    description: 'Privacy-focused projects and discussions'
  },
  'scaling': {
    label: 'Scaling',
    enableDonation: true,
    description: 'Scaling solutions and projects'
  },
  'layer2': {
    label: 'Layer 2',
    enableDonation: true,
    description: 'Layer 2 solutions and projects'
  }
};

// Helper function to check if a category supports donations
export const isDonationEnabled = (category) => {
  return CATEGORIES[category]?.enableDonation || false;
};

// Get all categories as an array
export const getCategoriesArray = () => {
  return Object.entries(CATEGORIES).map(([key, value]) => ({
    id: key,
    ...value
  }));
};

// Get only donation-enabled categories
export const getDonationEnabledCategories = () => {
  return Object.entries(CATEGORIES)
    .filter(([_, value]) => value.enableDonation)
    .map(([key, value]) => ({
      id: key,
      ...value
    }));
};