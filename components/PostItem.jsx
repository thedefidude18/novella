import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, useOrbis } from "@orbisclub/components";
import { getIpfsLink } from "../utils";
import { CommentsIcon } from './Icons';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import Upvote from './Upvote';
import { marked } from 'marked';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import {
  FaShare,
  FaTag,
  FaEthereum,
  FaEllipsisH,
  FaTrophy, FaEllipsisV,
} from 'react-icons/fa';
import DonateButton from './DonateButton';
import { CATEGORIES } from '../config/categories';
import useOutsideClick from '../hooks/useOutsideClick';
import { POINTS_RULES } from '../config/points';
import ChatModal from './ChatModal'; // Ensure this path is correct




// Initialize TimeAgo
if (!TimeAgo.getDefaultLocale()) {
  TimeAgo.addDefaultLocale(en);
}

const timeAgo = new TimeAgo('en-US');

export default function PostItem({ post }) {
  const { orbis, user } = useOrbis();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [categories, setCategories] = useState([]);
  const [updatedPost, setUpdatedPost] = useState(post);
  const [showMenu, setShowMenu] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [totalDonations, setTotalDonations] = useState({
    USDT: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef(null);
  

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  

  // State to manage the visibility of the chat modal
  const [isChatVisible, setIsChatVisible] = useState(false);

  // Function to toggle the visibility of the chat modal
  const toggleChatVisibility = () => {
    setIsChatVisible((prevState) => !prevState);
  };

  useOutsideClick(menuRef, () => setShowMenu(false));

  useEffect(() => {
    if (post) {
      loadUserPoints();
      loadDonations();
      checkReaction();
    }
  }, [post]);

  useEffect(() => {
    const categoriesArray = Object.entries(CATEGORIES).map(
      ([stream_id, content]) => ({
        stream_id,
        content,
      })
    );
    setCategories(categoriesArray);
  }, []);

  const categoryName =
    categories.find((cat) => cat.stream_id === post.content.context)?.content
      ?.label || 'General';

  async function loadUserPoints() {
    if (post.creator_details?.did) {
      try {
        const { data: profile } = await orbis.getProfile(
          post.creator_details.did
        );
        const points = profile?.details?.profile?.metadata?.points || 0;
        setUserPoints(points);
      } catch (error) {
        console.error('Error loading user points:', error);
      }
    }
  }

  async function loadDonations() {
    try {
      const { data: donations } = await orbis.getPosts({
        context: post.stream_id,
        only_master: false,
      });

      const donationAmount = {
        USDT: 0
      };

      donations?.forEach((donation) => {
        if (donation.content?.data?.type === 'donation' && donation.content.data.token === 'USDT') {
          donationAmount.USDT += parseFloat(donation.content.data.amount);
        }
      });

      setTotalDonations(donationAmount);
    } catch (error) {
      console.error('Error loading donations:', error);
    }
  }

  async function updateUserPoints(did, pointsToAdd) {
    try {
      const { data: profile } = await orbis.getProfile(did);
      const currentPoints = profile?.details?.profile?.metadata?.points || 0;
      const newPoints = currentPoints + pointsToAdd;

      const res = await orbis.updateProfile({
        ...profile?.details?.profile,
        metadata: {
          ...profile?.details?.profile?.metadata,
          points: newPoints,
        },
      });

      return res.status === 200;
    } catch (error) {
      console.error('Error updating points:', error);
      return false;
    }
  }

  async function checkReaction() {
    if (user) {
      let { data } = await orbis.getReaction(post.stream_id, user.did);
      if (data && data.type === 'like') {
        setHasLiked(true);
      }
    }
  }

  async function like() {
    if (user) {
      setIsLoading(true);
      try {
        setHasLiked(true);
        setUpdatedPost({
          ...updatedPost,
          count_likes: post.count_likes + 1,
        });

        const res = await orbis.react(post.stream_id, 'like');

        if (res.status === 200 && post.creator_details?.did) {
          const pointsAwarded = await updateUserPoints(
            post.creator_details.did,
            POINTS_RULES.RECEIVE_LIKE
          );
          if (pointsAwarded) {
            setUserPoints((prev) => prev + POINTS_RULES.RECEIVE_LIKE);
          }
        }
      } catch (error) {
        console.error('Error liking post:', error);
        alert('Failed to like post. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      alert('You must be connected to react to posts.');
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.content.title,
        text: post.content.body,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleEmbedCopy = () => {
    const embedCode = `<iframe 
      src="${window.location.origin}/embed/${post.stream_id}"
      width="100%"
      height="400"
      frameborder="0"
      style="border: 1px solid #E5E7EB; border-radius: 8px;"
      title="${post.content?.title || 'Embedded post'}"
    ></iframe>`;

    try {
      navigator.clipboard.writeText(embedCode);
      alert('Embed code copied! You can now paste it into your website.');
    } catch (err) {
      console.error('Failed to copy embed code:', err);
      const textarea = document.createElement('textarea');
      textarea.value = embedCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Embed code copied! You can now paste it into your website.');
    }
    setShowMenu(false);
  };

  const handleReport = async () => {
    if (!user) {
      alert('You must be connected to report posts.');
      return;
    }

    setIsLoading(true);
    try {
      await orbis.createPost({
        context: 'report',
        body: 'Post reported for review',
        data: {
          type: 'report',
          post_id: post.stream_id,
          reason: 'reported_by_user',
        },
      });
      alert(
        'Post has been reported. Thank you for helping keep the community safe.'
      );
    } catch (error) {
      console.error('Error reporting post:', error);
      alert('Failed to report post. Please try again.');
    } finally {
      setIsLoading(false);
      setShowMenu(false);
    }
  };

  const handleMuteAuthor = async () => {
    if (!user) {
      alert('You must be connected to mute users.');
      return;
    }

    setIsLoading(true);
    try {
      const currentProfile = user?.details?.profile || {};
      const mutedUsers = currentProfile.mutedUsers || [];
      await orbis.updateProfile({
        ...currentProfile,
        mutedUsers: [...mutedUsers, post.creator_details.did],
      });
      alert('Author has been muted.');
    } catch (error) {
      console.error('Error muting author:', error);
      alert('Failed to mute author. Please try again.');
    } finally {
      setIsLoading(false);
      setShowMenu(false);
    }
  };

  const formatDonation = (amount) => {
    return parseFloat(amount).toFixed(4);
  };

  const showDonateButton =
    CATEGORIES[post.content?.context]?.enableDonation || false;

  return (
<div className="bg-white dark:bg-dark-secondary border-b border-gray-300 dark:border-gray-700 w-full">
<div className="p-6">
        <div className="flex items-start space-x-4">
          <Upvote
            like={like}
            active={hasLiked}
            count={updatedPost.count_likes || 0}
            disabled={isLoading}
            iconClass="w-2 h-2"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User details={post.creator_details} />
                <img 
                  src="/social-media.png"
                  alt="Verified" 
                  className="w-4 h-4" 
                  title="Verified"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {timeAgo.format(post.timestamp * 1000)}
                </span>
                {post.content?.context && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <FaTag className="mr-1" />
                      {categoryName}
                    </span>
                  </>
                )}
                <span className="text-gray-300 dark:text-gray-600">•</span>
              </div>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-tertiary transition-colors"
                  disabled={isLoading}
                >
                  <FaEllipsisH className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-secondary rounded-lg shadow-lg py-1 z-10 border border-gray-200 dark:border-dark-border">
                    <button
                      onClick={handleEmbedCopy}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-dark-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary"
                      disabled={isLoading}
                    >
                      Embed this post
                    </button>
                    <button
                      onClick={handleReport}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-dark-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary"
                      disabled={isLoading}
                    >
                      Report post
                    </button>
                    <button
                      onClick={handleMuteAuthor}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-dark-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary"
                      disabled={isLoading}
                    >
                      Mute author
                    </button>
                  </div>
                )}
              </div>
            </div>

            <Link href={'/post/' + post.stream_id}>
              <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-dark-primary hover:text-blue-600 dark:hover:text-blue-400">
                {post.content?.title}
              </h2>
            </Link>

            <div className="mt-2 text-base text-gray-600 dark:text-dark-secondary line-clamp-3">
              {parse(DOMPurify.sanitize(marked(post.content?.body || '')))}
            </div>

            {post.content?.media && post.content.media[0] && (
              <div className="mt-4">
                <img
                  src={getIpfsLink(post.content.media[0])}
                  alt={post.content.title}
                  className="rounded-lg max-h-96 object-cover"
                />
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <button
                  className="flex items-center hover:text-gray-700"
                  onClick={() =>
                    (window.location.href = `/post/${post.stream_id}#comments`)
                  }
                  disabled={isLoading}
                >
                  <CommentsIcon className="mr-2" />
                  {post.count_replies || 0}
                </button>

                <button onClick={toggleChatVisibility}>Chat</button>
                <ChatModal isVisible={isChatVisible} onClose={toggleChatVisibility} />

            

                <span className="inline-flex items-center text-sm font-medium text-yellow-600">
                  {userPoints} points
                </span>

                <button
                  className="flex items-center hover:text-gray-700"
                  onClick={handleShare}
                  disabled={isLoading}
                >
                  <FaShare className="mr-1" />
                </button>

                {showDonateButton && (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Raised:</span>
                      <div className="flex items-center text-green-600">
                        <FaEthereum className="mr-1" />
                        <span>
                          {formatDonation(totalDonations.USDT)} USDT
                        </span>
                      </div>
                    </div>

                    <DonateButton post={post} disabled={isLoading} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}