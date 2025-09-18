import React from 'react';

interface DashboardProps {
  userRole: string;
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userRole, onNavigate }) => {
  const mockStats = {
    points: 85,
    totalPoints: 100,
    questionsAnswered: 12,
    totalQuestions: 15,
    forumPosts: 8,
    peerQuestions: 3
  };

  const mockRecentPosts = [
    { id: 1, author: "Sarah Chen", content: "How does database normalization help with data integrity?", time: "2 min ago" },
    { id: 2, author: "Mike Johnson", content: "I think the third normal form is the most important...", time: "5 min ago" },
    { id: 3, author: "Alex Kim", content: "Can someone explain the difference between SQL and NoSQL?", time: "8 min ago" }
  ];

  const mockActiveQuestions = [
    { id: 1, text: "What is the primary purpose of database normalization?", type: "Multiple Choice" },
    { id: 2, text: "Explain the ACID properties in database transactions", type: "Short Answer" },
    { id: 3, text: "Draw an ER diagram for a library management system", type: "Drawing" }
  ];

  const mockTeams = [
    { id: 1, name: "Team Alpha", members: 4, project: "Database Design" },
    { id: 2, name: "Team Beta", members: 3, project: "Query Optimization" },
    { id: 3, name: "Team Gamma", members: 5, project: "Data Modeling" }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-card">
        <h3>Live Forum</h3>
        <div style={{ marginBottom: '1rem' }}>
          <button 
            className="btn" 
            onClick={() => onNavigate('forum')}
          >
            Post Message
          </button>
        </div>
        <div>
          <h4>Recent Posts:</h4>
          {mockRecentPosts.map(post => (
            <div key={post.id} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px' }}>
              <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>"{post.content}"</div>
              <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>- {post.author} ({post.time})</div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Active Questions</h3>
        {mockActiveQuestions.map(question => (
          <div key={question.id} style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{question.text}</div>
            <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Type: {question.type}</div>
          </div>
        ))}
        <button 
          className="btn" 
          onClick={() => onNavigate('questions')}
        >
          Answer Now
        </button>
      </div>

      <div className="dashboard-card">
        <h3>Team Projects</h3>
        {mockTeams.map(team => (
          <div key={team.id} style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{team.name}</div>
            <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
              {team.members} members • {team.project}
            </div>
          </div>
        ))}
        <button 
          className="btn" 
          onClick={() => onNavigate('teams')}
        >
          Join Team
        </button>
      </div>

      <div className="dashboard-card participation-summary">
        <h3>Participation Summary</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{mockStats.points}/{mockStats.totalPoints}</div>
            <div className="stat-label">Points</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{mockStats.questionsAnswered}/{mockStats.totalQuestions}</div>
            <div className="stat-label">Questions Answered</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{mockStats.forumPosts}</div>
            <div className="stat-label">Forum Posts</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{mockStats.peerQuestions}</div>
            <div className="stat-label">Peer Questions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
