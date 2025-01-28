import React, { useState, useEffect } from 'react';
import { useOrbis } from '@orbisclub/components';
import PostItem from './PostItem';
import { LoadingCircle } from './Icons';

const Feed = ({ onRefresh }) => {
  const { orbis } = useOrbis();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch feed data
  const fetchFeedData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await orbis.getPosts(
        {
          context: global.orbis_context,
          only_master: true,
          include_child_contexts: true,
          order_by: 'last_reply_timestamp',
        },
        0,
        50
      ); // Fetch up to 50 posts

      if (error) {
        setError('Failed to fetch feed data. Please try again.');
      } else {
        setPosts(data);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch feed data on component mount
  useEffect(() => {
    fetchFeedData();
  }, []);

  // Pass the refresh function to the parent component
  useEffect(() => {
    if (onRefresh) {
      onRefresh(fetchFeedData);
    }
  }, [onRefresh]);

  return (
    <div>
      {/* Loading State */}
      {isLoading && (
        <div className="mt-8 flex justify-center">
          <LoadingCircle className="w-8 h-8 text-blue-500" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Feed Posts */}
      {!isLoading && !error && (
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => <PostItem key={post.stream_id} post={post} />)
          ) : (
            <div className="text-center text-gray-500">
              No posts found. Be the first to create one!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Feed;
