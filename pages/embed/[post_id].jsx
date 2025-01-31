import React from 'react';
import { Orbis } from "@orbisclub/components";
import { marked } from "marked";
import DOMPurify from "dompurify";
import parse from "html-react-parser";
import { getIpfsLink } from "../../utils";
import DonateButton from "../../components/DonateButton";
import { isDonationEnabled } from "../../config/categories";
import Image from 'next/image';


// Create Orbis instance outside component for reuse
const orbis_server = new Orbis({
  useLit: false,
  node: "https://node2.orbis.club",
  PINATA_GATEWAY: 'https://orbis.mypinata.cloud/ipfs/'
});

export default function PostEmbed({ post, error }) {
  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        {error}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Post not found
      </div>
    );
  }

  const showDonateButton = isDonationEnabled(post.content?.context);

  return (
    <div className="max-w-full mx-auto bg-white p-4 font-sans antialiased embed-container">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          {post.content?.title}
        </h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <span>{post.creator_details?.profile?.username || 'Anonymous'}</span>
            <span className="mx-2">•</span>
            <span>
              {new Date(post.timestamp * 1000).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          {showDonateButton && (
            <DonateButton post={post} />
          )}
        </div>
      </div>

      <div className="prose prose-sm max-w-none">
        {post.content?.media && post.content.media[0] && (
          <div className="mb-4">
            <image
              src={getIpfsLink(post.content.media[0])}
              alt={post.content.title}
              className="w-full h-auto rounded-lg"
              loading="lazy"
            />
          </div>
        )}
        <div className="text-gray-600">
          {parse(DOMPurify.sanitize(marked(post.content?.body || '')))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <a
          href={`${process.env.NEXT_PUBLIC_APP_URL || ''}/post/${post.stream_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View full post →
        </a>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { post_id } = context.params;

  try {
    // Add timeout to the fetch request
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 5000);
    });

    const fetchPromise = orbis_server.getPost(post_id);
    
    // Race between the fetch and the timeout
    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

    if (error) {
      return {
        props: {
          post: null,
          error: error.message || 'Failed to fetch post'
        }
      };
    }

    if (!data) {
      return {
        props: {
          post: null,
          error: 'Post not found'
        }
      };
    }

    // Clean and sanitize the data before sending to client
    const sanitizedPost = {
      ...data,
      content: {
        ...data.content,
        body: data.content?.body || '',
        title: data.content?.title || 'Untitled Post'
      }
    };

    return {
      props: {
        post: sanitizedPost,
        error: null
      }
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    return {
      props: {
        post: null,
        error: 'Failed to load post. Please try again later.'
      }
    };
  }
}