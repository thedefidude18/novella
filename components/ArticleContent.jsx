import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ReactTimeAgo from 'react-time-ago';
import { Orbis, Discussion, User, useOrbis } from "@orbisclub/components";
import { shortAddress, getIpfsLink } from "../utils";
import { ExternalLinkIcon, EditIcon } from "./Icons";
import Upvote from "./Upvote";
import UrlMetadata from "./UrlMetadata";
import ProofBadge from "./ProofBadge";
import { marked } from 'marked';

export default function ArticleContent({ post }) {
  const { orbis, user } = useOrbis();
  const [hasLiked, setHasLiked] = useState(false);
  const [updatedPost, setUpdatedPost] = useState(post);

  // Convert Markdown to HTML (Assumes content is in Markdown format)
  const htmlContent = marked(post.content.body);

  /** Check if user liked this post */
  useEffect(() => {
    if (user) {
      getReaction();
    }

    async function getReaction() {
      let { data, error } = await orbis.getReaction(post.stream_id, user.did);
      if (data && data.type && data.type === "like") {
        setHasLiked(true);
      }
    }
  }, [user]);

  /** Will like / upvote the post */
  async function like() {
    if (user) {
      setHasLiked(true);
      setUpdatedPost({
        ...updatedPost,
        count_likes: post.count_likes + 1,
      });
      let res = await orbis.react(post.stream_id, "like");
      console.log("res:", res);
    } else {
      alert("You must be connected to react to posts.");
    }
  }

  return (
    <>
      <div className="article-container">
        {/* Render the post title */}
        <h1 className="article-title">{post.content.title}</h1>

        {/* Render the converted Markdown content */}
        <div className="article-body" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>

      <article className="w-full mb-8 pr-6">
        {/* Post header */}
        <header>
          <div className="flex flex-row items-center">
            <Upvote like={like} active={hasLiked} count={updatedPost.count_likes} />
            <h1 className="text-6xl text-primary mb-4 valverde">{post.content.title}</h1>
          </div>

          {/** Article Metadata */}
          <div className="flex items-center justify-between mt-4 mb-4">
            <div className="text-xs text-secondary flex flex-row items-center flex-wrap">
              {/* Post date & creator details */}
              <span className="text-brand">—</span>{" "}
              <ReactTimeAgo date={post.timestamp * 1000} locale="en-US" />{" "}
              <span className="text-secondary mr-2 ml-2">·</span>
              <span className="text-primary">
                <User hover={true} details={post.creator_details} />
              </span>
              <span className="text-secondary mr-2 ml-2">·</span>

              {/** Proof link to Cerscan */}
              {post.stream_id && <ProofBadge stream_id={post.stream_id} />}

              {/** Edit button if user is creator of the post */}
              {user && user.did === post.creator && (
                <>
                  <span className="text-secondary mr-2 ml-2">·</span>
                  <Link href={"/edit/" + post.stream_id} className="btn-sm py-1.5 btn-brand">
                    <EditIcon style={{ marginRight: 4 }} />Edit
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/** Display main image if any */}
        {post.content.media && post.content.media.length > 0 && (
          <img className="w-full mb-4" src={getIpfsLink(post.content.media[0])} alt={post.content.title} />
        )}

        {/* Post content */}
        <div className="text-slate-500 space-y-8 article-content">
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>

        {/** Display URL metadata if any */}
        {post.indexing_metadata?.urlMetadata?.title && (
          <UrlMetadata metadata={post.indexing_metadata.urlMetadata} />
        )}

        {/** Show commenting feed only if not new post */}
        {post.stream_id && (
          <div className="mt-8">
            <Discussion context={post.content.context} master={post.stream_id} />
          </div>
        )}
      </article>
    </>
  );
}