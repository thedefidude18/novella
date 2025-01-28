import React, { useState, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useOrbis } from '@orbisclub/components';
import { LoadingCircle } from './Icons';
import { getIpfsLink, sleep } from '../utils';
import { HiLink, HiCode, HiPhotograph, HiSparkles } from 'react-icons/hi';
import { POINTS_RULES } from '../config/points';
import { useRouter } from 'next/router';
import Toast from './Toast';

async function updateUserPoints(orbis, did, points) {
  try {
    const { data: profile } = await orbis.getProfile(did);
    const currentPoints = profile?.details?.metadata?.points || 0;
    const newPoints = currentPoints + points;

    const res = await orbis.updateProfile({
      ...profile?.details?.profile,
      metadata: {
        ...profile?.details?.metadata,
        points: newPoints
      }
    });

    return res.status === 200;
  } catch (error) {
    console.error('Error updating points:', error);
    return false;
  }
}

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const dropdownRef = useRef(null);
  const textareaRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  const resetForm = () => {
    setTitle('');
    setBody('');
    setMedia([]);
    setCategory('');
    setError('');
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setIsDropdownOpen(false);
  };

  const wrapText = (before, after, defaultText = '') => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || defaultText;
    
    const newText = textarea.value.substring(0, start) + 
                   before + selectedText + after + 
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
        if(res.status === 200) {
          wrapText('![', `](${getIpfsLink(res.result)})`, 'Image description');
          setMedia([...media, res.result]);
        } else {
          setError("Error uploading image. Please try again.");
        }
      } catch (err) {
        setError("Failed to upload image. Please try again.");
      }
    }
    setMediaLoading(false);
  };

  const generatePost = async () => {
    if (!user) {
      showToast('You must be connected to use this feature.', 'error');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/generate-post-anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate post');
      }

      const data = await response.json();
      
      if (!data.content) {
        throw new Error('No content received from API');
      }

      // Split content into title and body
      const lines = data.content.split('\n');
      const generatedTitle = lines[0].replace(/^#\s+/, ''); // Remove markdown heading
      const generatedBody = lines.slice(2).join('\n').trim(); // Skip the title and empty line

      setTitle(generatedTitle);
      setBody(generatedBody);
      showToast('Post generated! Feel free to edit before posting.', 'success');
    } catch (error) {
      console.error('Error generating post:', error);
      showToast(error.message || 'Failed to generate post. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  async function updateArticle() {
    if (!category) {
      setError("Please select a category");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    if (!body.trim()) {
      setError("Please enter content");
      return;
    }

    setStatus(1);
    setError("");

    try {
      const content = {
        title: title.trim(),
        body: body.trim(),
        context: category,
        media: media
      };

      const res = post 
        ? await orbis.editPost(post.stream_id, content)
        : await orbis.createPost(content);

      if (res.status === 200) {
        // Award points for new posts only
        if (!post && user) {
          const pointsAwarded = await updateUserPoints(orbis, user.did, POINTS_RULES.CREATE_POST);
          if (pointsAwarded) {
            showToast(`🎉 Earned ${POINTS_RULES.CREATE_POST} points for creating a post!`, 'success');
          }
        }

        setStatus(2);
        resetForm();
        
        if (onPostCreated) {
          await onPostCreated();
        }
        
        await sleep(500);
        
        if (router.pathname !== '/') {
          await router.replace('/');
        }
      } else {
        throw new Error(res.error || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating/editing post:", error);
      setError(error.message || "Failed to create post");
      setStatus(3);
      await sleep(1000);
      setStatus(0);
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4">
          <div className="flex flex-col space-y-4">
            <TextareaAutosize
              placeholder="What are you building?"
              className="w-full resize-none text-gray-900 placeholder-gray-500 p-3 focus:outline-none text-xl font-medium border border-gray-200 rounded-lg"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            <TextareaAutosize
              ref={textareaRef}
              placeholder="Share your story..."
              className="w-full resize-none text-gray-900 placeholder-gray-500 p-3 focus:outline-none min-h-[200px] border border-gray-200 rounded-lg"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  {category || "Select category"}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-1 z-10 max-h-64 overflow-y-auto border border-gray-200">
                    {Object.entries(CATEGORIES).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => handleCategorySelect(key)}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        <div className="font-medium text-gray-900">{value.label}</div>
                        <div className="text-xs text-gray-500">{value.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={generatePost}
                  disabled={isGenerating}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded"
                  title="Generate post with AI"
                >
                  {isGenerating ? <LoadingCircle /> : <HiSparkles className="w-5 h-5" />}
                </button>
                <button onClick={addBold} className="p-2 text-gray-500 hover:text-gray-700 rounded">
                  <strong>B</strong>
                </button>
                <button onClick={addItalic} className="p-2 text-gray-500 hover:text-gray-700 rounded">
                  <em>I</em>
                </button>
                <button onClick={addHeading2} className="p-2 text-gray-500 hover:text-gray-700 rounded">
                  H2
                </button>
                <button onClick={addHeading3} className="p-2 text-gray-500 hover:text-gray-700 rounded">
                  H3
                </button>
                <button onClick={addCodeBlock} className="p-2 text-gray-500 hover:text-gray-700 rounded">
                  <HiCode />
                </button>
                <button onClick={addLink} className="p-2 text-gray-500 hover:text-gray-700 rounded">
                  <HiLink />
                </button>
                <label className="p-2 text-gray-500 hover:text-gray-700 rounded cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={addImage}
                    disabled={mediaLoading}
                  />
                  {mediaLoading ? <LoadingCircle /> : <HiPhotograph />}
                </label>
              </div>
            </div>

            <button
              onClick={updateArticle}
              disabled={!category || !title || !body || status === 1}
              className={`px-4 py-2 rounded-full font-medium ${
                status === 1 
                  ? 'bg-blue-400 text-white cursor-not-allowed'
                  : (!category || !title || !body)
                    ? 'bg-blue-300 text-white cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {status === 1 ? (
                <div className="flex items-center">
                  <LoadingCircle />
                  <span className="ml-2">Posting...</span>
                </div>
              ) : (
                'Post'
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </>
  );
};

export default Editor;