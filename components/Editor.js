import React, { useState, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useOrbis } from '@orbisclub/components';
import { LoadingCircle } from './Icons';
import { getIpfsLink, sleep } from '../utils';
import { HiLink, HiCode, HiPhotograph, HiSparkles } from 'react-icons/hi';
import { useRouter } from 'next/router';

const Editor = ({ post, onPostCreated }) => {
  const { orbis, user } = useOrbis();
  const router = useRouter();
  const [title, setTitle] = useState(post?.content?.title || '');
  const [body, setBody] = useState(post?.content?.body || '');
  const [media, setMedia] = useState(post?.content?.media || []);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [category, setCategory] = useState(post?.content?.context || '');
  const [status, setStatus] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);
  const textareaRef = useRef();

  // Define the points rules
const POINTS_RULES = {
  CREATE_POST: 10, // Example: Award 10 points for creating a post
  // Add other rules as needed
};

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const resetForm = () => {
    setTitle('');
    setBody('');
    setMedia([]);
    setCategory('');
    setError('');
  };

  const wrapText = (before, after, defaultText = '') => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || defaultText;

    const newText =
      textarea.value.substring(0, start) +
      before +
      selectedText +
      after +
      textarea.value.substring(end);

    setBody(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const addBold = () => wrapText('**', '**', 'bold text');
  const addItalic = () => wrapText('_', '_', 'italic text');
  const addHeading2 = () => wrapText('## ', '\n', 'Heading 2');
  const addHeading3 = () => wrapText('### ', '\n', 'Heading 3');
  const addCodeBlock = () => wrapText('```\n', '\n```', 'code block');
  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      wrapText('[', `](${url})`, 'link text');
    }
  };

  const addImage = async (event) => {
    setMediaLoading(true);
    const file = event.target.files[0];
    if (file && file.type.match(/^image\//)) {
      try {
        let res = await orbis.uploadMedia(file);
        if (res.status === 200) {
          wrapText('![', `](${getIpfsLink(res.result)})`, 'Image description');
          setMedia([...media, res.result]);
        } else {
          setError('Error uploading image. Please try again.');
        }
      } catch (err) {
        setError('Failed to upload image. Please try again.');
      }
    }
    setMediaLoading(false);
  };
// Function to award points
async function awardPoints(did, points) {
  try {
    // Fetch the user's current profile
    const { data: profile } = await orbis.getProfile(did);

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Get the current points from the profile metadata (default to 0 if not set)
    const currentPoints = profile.details?.metadata?.points || 0;
    console.log('Current Points:', currentPoints); // Debug log

    // Calculate the new points total
    const newPoints = currentPoints + points;

    // Update the user's profile with the new points total
    const updateRes = await orbis.updateProfile({
      ...profile.details.profile,
      metadata: {
        ...profile.details.metadata,
        points: newPoints, // Update the points in metadata
      },
    });

    if (updateRes.status === 200) {
      console.log('Points awarded successfully:', { did, points: newPoints });
      return { success: true, did, points: newPoints };
    } else {
      throw new Error(updateRes.error || 'Failed to update profile');
    }
  } catch (error) {
    console.error('Error awarding points:', error);
    return { success: false, error: error.message };
  }
}

  // Function to generate post content using AI
  const generatePostWithAI = async () => {
    if (!user) {
      alert('You must be connected to use this feature.');
      return;
    }

    setIsAILoading(true);

    try {
      const response = await fetch('/api/generate-post-anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Write a short post about building in web3.',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate post');
      }

      const data = await response.json();
      setBody(data.content);
    } catch (error) {
      console.error('Error generating post:', error);
      setError('Failed to generate post. Please try again.');
    } finally {
      setIsAILoading(false);
    }
  };

  async function updateArticle() {
    if (!category) {
      setError('Please select a category');
      return;
    }
  
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
  
    if (!body.trim()) {
      setError('Please enter content');
      return;
    }
  
    setStatus(1);
    setError('');
  
    try {
      const content = {
        title: title.trim(),
        body: body.trim(),
        context: category,
        media: media,
      };
  
      const res = post
        ? await orbis.editPost(post.stream_id, content)
        : await orbis.createPost(content);
  
      if (res.status === 200) {
        // Only award points for new posts
        if (!post && user) {
          // Award points but don't wait for it
          awardPoints(user.did, 10) // Example: Award 10 points for creating a post
            .then((response) => {
              if (response.success) {
                console.log('Points awarded successfully:', response);
              } else {
                console.error('Error awarding points:', response.error);
              }
            })
            .catch((error) => {
              console.error('Error awarding points:', error);
            });
        }
  
        setStatus(2);
  
        // Clear form immediately after successful post
        setTitle('');
        setBody('');
        setMedia([]);
        setCategory('');
        setError('');
  
        // Notify parent component about the new post
        if (onPostCreated) {
          await onPostCreated(); // Trigger feed refresh
        }
  
        await sleep(500);
  
        // Only navigate if we're not already on the home page
        if (router.pathname !== '/') {
          await router.replace('/');
        }
      } else {
        throw new Error(res.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating/editing post:', error);
      setError(error.message || 'Failed to create post');
      setStatus(3);
      await sleep(1000);
      setStatus(0);
    }
  }

  
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm">
      <div className="p-4">
        {/* User Avatar and Input Area */}
        <div className="flex items-start space-x-3">
          <div className="flex-grow">
            <TextareaAutosize
              placeholder="What are you Building?"
              className="w-full resize-none text-gray-900 placeholder-gray-500 p-2 focus:outline-none text-md border border-gray-300 rounded-lg"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <TextareaAutosize
              ref={textareaRef}
              placeholder="Description"
              className="w-full resize-none text-gray-900 placeholder-gray-500 p-2 focus:outline-none min-h-[100px] border border-gray-300 rounded-lg mt-2"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}

        {/* Toolbar */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center space-x-2">
            {/* AI Button */}
            <ToolbarIconButton
              onClick={generatePostWithAI}
              loading={isAILoading}
            >
              <HiSparkles className="w-5 h-5" />
            </ToolbarIconButton>

            <ToolbarIconButton
              onClick={addImage}
              isImage={true}
              loading={mediaLoading}
            >
              <HiPhotograph className="w-5 h-5" />
            </ToolbarIconButton>
            <ToolbarIconButton onClick={addBold}>
              <span className="font-bold">B</span>
            </ToolbarIconButton>
            <ToolbarIconButton onClick={addItalic}>
              <span className="italic">I</span>
            </ToolbarIconButton>
            <ToolbarIconButton onClick={addCodeBlock}>
              <HiCode className="w-5 h-5" />
            </ToolbarIconButton>

            {/* Category Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                {category || 'Category'}
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                  {[
                    'projects',
                    'public-goods',
                    'dapps',
                    'events',
                    'research',
                    'governance',
                    'tutorials',
                    'announcements',
                    'discussions',
                  ].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Post Button */}
          <button
            onClick={updateArticle}
            disabled={!category || !title || !body || status === 1}
            className={`px-4 py-1.5 rounded-full font-medium ${
              status === 1
                ? 'bg-blue-400 text-white cursor-not-allowed'
                : !category || !title || !body
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {status === 1 ? (
              <div className="flex items-center">
                <LoadingCircle className="w-4 h-4 mr-2" />
                Posting...
              </div>
            ) : (
              'Post'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ToolbarIconButton = ({ children, onClick, isImage, loading }) => {
  if (isImage) {
    return (
      <>
        {loading ? (
          <button
            disabled
            className="p-2 text-gray-500 rounded-full hover:bg-gray-100"
          >
            <LoadingCircle className="w-5 h-5" />
          </button>
        ) : (
          <>
            <input
              type="file"
              id="imageInputPost"
              className="hidden"
              accept="image/*"
              onChange={onClick}
            />
            <label
              htmlFor="imageInputPost"
              className="p-2 text-gray-500 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              {children}
            </label>
          </>
        )}
      </>
    );
  }

  return (
    <button
      onClick={onClick}
      className="p-2 text-gray-500 rounded-full hover:bg-gray-100"
    >
      {children}
    </button>
  );
};

export default Editor;