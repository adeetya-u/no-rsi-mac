import React, { useState } from 'react';

interface ForumProps {
  userRole: string;
  onNavigate: (view: string) => void;
}

interface ForumPost {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
}

const Forum: React.FC<ForumProps> = ({ userRole, onNavigate }) => {
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState<ForumPost[]>([
    {
      id: 1,
      author: "Sarah Chen",
      content: "How does database normalization help with data integrity? I'm struggling to understand the practical benefits.",
      timestamp: "2 minutes ago",
      likes: 5,
      replies: 3
    },
    {
      id: 2,
      author: "Mike Johnson",
      content: "I think the third normal form is the most important for eliminating transitive dependencies. What do you all think?",
      timestamp: "5 minutes ago",
      likes: 8,
      replies: 2
    },
    {
      id: 3,
      author: "Alex Kim",
      content: "Can someone explain the difference between SQL and NoSQL databases? When would you use each?",
      timestamp: "8 minutes ago",
      likes: 12,
      replies: 7
    },
    {
      id: 4,
      author: "Professor Smith",
      content: "Great question Alex! SQL databases are relational and use structured query language, while NoSQL databases are non-relational and can handle unstructured data. SQL is better for complex queries and ACID compliance, while NoSQL excels at scalability and flexibility.",
      timestamp: "10 minutes ago",
      likes: 15,
      replies: 1
    },
    {
      id: 5,
      author: "Emma Davis",
      content: "For the upcoming project, should we use MySQL or PostgreSQL? I've heard PostgreSQL has better JSON support.",
      timestamp: "15 minutes ago",
      likes: 6,
      replies: 4
    }
  ]);

  const handleSubmitPost = () => {
    if (newPost.trim()) {
      const post: ForumPost = {
        id: Date.now(),
        author: userRole === 'professor' ? 'Professor Smith' : 'You',
        content: newPost,
        timestamp: 'Just now',
        likes: 0,
        replies: 0
      };
      setPosts([post, ...posts]);
      setNewPost('');
    }
  };

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  return (
    <div className="forum-container">
      <div className="forum-header">
        <h2>Class Discussion Forum</h2>
        <p style={{ color: '#7f8c8d', margin: '0' }}>
          Share ideas, ask questions, and collaborate with your classmates
        </p>
      </div>

      <div style={{ padding: '1.5rem' }}>
        <div className="post-form">
          <textarea
            className="post-input"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your thoughts, ask a question, or start a discussion..."
            rows={4}
          />
          <button
            className="post-submit"
            onClick={handleSubmitPost}
            disabled={!newPost.trim()}
          >
            Post Message
          </button>
        </div>

        <div className="posts-list">
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50' }}>Recent Discussions</h3>
          {posts.map(post => (
            <div key={post.id} className="post-item">
              <div className="post-header">
                <div>
                  <span className="post-author">{post.author}</span>
                  <span style={{ margin: '0 0.5rem', color: '#bdc3c7' }}>•</span>
                  <span className="post-time">{post.timestamp}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                    {post.likes} likes • {post.replies} replies
                  </span>
                </div>
              </div>
              <div className="post-content">
                {post.content}
              </div>
              <div className="post-actions">
                <button 
                  className="post-action"
                  onClick={() => handleLike(post.id)}
                >
                  👍 Like ({post.likes})
                </button>
                <button className="post-action">
                  💬 Reply
                </button>
                <button className="post-action">
                  🔗 Share
                </button>
                {userRole === 'professor' && (
                  <button className="post-action" style={{ color: '#e74c3c' }}>
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Forum;
