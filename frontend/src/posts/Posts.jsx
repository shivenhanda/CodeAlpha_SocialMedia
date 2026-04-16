import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Posts({name}) {
  const {
    token,
    refreshFeed,
    posts = []
  } = useAuth();

  const [newContent, setNewContent] = useState('');
  const [newImageURL, setNewImageURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedLoading, setFeedLoading] = useState(true);

  const createPost = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newContent,
          imageURL: newImageURL
        })
      });

      const data = await res.json();

      if (data.success) {
        setNewContent('');
        setNewImageURL('');
        await refreshFeed();
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const toggleLike = async (postId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/posts/${postId}/like`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      if (data.success) await refreshFeed();
    } catch (err) {
      console.error(err);
    }
  };

  const addComment = async (postId, text) => {
    try {
      const res = await fetch(`http://localhost:8000/api/posts/${postId}/comment`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      const data = await res.json();

      if (data.success) {
        await refreshFeed();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteComment = async (postId, commentId) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/posts/${postId}/comment/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (data.success) {
        await refreshFeed();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setFeedLoading(true);
      await refreshFeed();
      setFeedLoading(false);
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4 space-y-8">

        {/* CREATE POST */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Create Post</h2>

          <form onSubmit={createPost} className="space-y-4">
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-4 border rounded-xl"
            />

            <input
              value={newImageURL}
              onChange={(e) => setNewImageURL(e.target.value)}
              placeholder="Image URL (optional)"
              className="w-full p-4 border rounded-xl"
            />

            <button
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </form>
        </div>

        {/* FEED */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Feed</h2>

          {feedLoading ? (
            <div>Loading feed...</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-gray-500">
              No posts found
            </div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="bg-white p-6 rounded-xl mb-4">

                <div className="font-bold">{post.user?.username}</div>
                <p className="mt-2">{post.content}</p>

                {post.imageURL && (
                  <img
                    src={post.imageURL}
                    className="mt-4 rounded-xl"
                  />
                )}

                {/* LIKE */}
                <div className="mt-4 flex gap-4">
                  <button onClick={() => toggleLike(post._id)}>
                    ❤️ {post.likesCount}
                  </button>

                  <span>💬 {post.commentsCount}</span>
                </div>

                {/* COMMENTS LIST */}
                <div className="mt-4 space-y-2">
                  {post.comments?.map((c) => (
                    <div
                      key={c._id}
                      className="bg-gray-100 p-2 rounded flex justify-between"
                    >
                      <div>
                        <b>{c.user?.username}</b> {c.text}
                      </div>

                      {(name === c.user?.username) ? <button
                        onClick={() => deleteComment(post._id, c._id)}
                        className="text-red-500 text-xs"
                      >
                        delete
                      </button> : ""}
                    </div>
                  ))}
                </div>

                {/* ADD COMMENT */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const text = e.target.comment.value.trim();
                    if (!text) return;

                    addComment(post._id, text);
                    e.target.reset();
                  }}
                  className="flex gap-2 mt-4"
                >
                  <input
                    name="comment"
                    placeholder="Write a comment..."
                    className="flex-1 p-2 border rounded-lg"
                  />

                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 rounded-lg"
                  >
                    Send
                  </button>
                </form>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}