import React, { useState } from 'react';

interface ParticipationAnalyticsProps {
  userRole: string;
  onNavigate: (view: string) => void;
}

interface Student {
  id: number;
  name: string;
  participationScore: number;
  questionsAnswered: number;
  forumPosts: number;
  peerQuestions: number;
  teamContributions: number;
}

const ParticipationAnalytics: React.FC<ParticipationAnalyticsProps> = ({ userRole, onNavigate }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('participation');

  const mockStudents: Student[] = [
    { id: 1, name: "Sarah Chen", participationScore: 92, questionsAnswered: 15, forumPosts: 12, peerQuestions: 8, teamContributions: 5 },
    { id: 2, name: "Mike Johnson", participationScore: 88, questionsAnswered: 14, forumPosts: 10, peerQuestions: 6, teamContributions: 4 },
    { id: 3, name: "Alex Kim", participationScore: 95, questionsAnswered: 16, forumPosts: 15, peerQuestions: 10, teamContributions: 6 },
    { id: 4, name: "Emma Davis", participationScore: 85, questionsAnswered: 12, forumPosts: 8, peerQuestions: 4, teamContributions: 3 },
    { id: 5, name: "David Wilson", participationScore: 90, questionsAnswered: 13, forumPosts: 11, peerQuestions: 7, teamContributions: 5 },
    { id: 6, name: "Lisa Zhang", participationScore: 87, questionsAnswered: 11, forumPosts: 9, peerQuestions: 5, teamContributions: 4 },
    { id: 7, name: "John Smith", participationScore: 82, questionsAnswered: 10, forumPosts: 6, peerQuestions: 3, teamContributions: 2 },
    { id: 8, name: "Maria Garcia", participationScore: 94, questionsAnswered: 17, forumPosts: 14, peerQuestions: 9, teamContributions: 7 },
    { id: 9, name: "Tom Brown", participationScore: 79, questionsAnswered: 8, forumPosts: 5, peerQuestions: 2, teamContributions: 1 },
    { id: 10, name: "Anna Lee", participationScore: 91, questionsAnswered: 14, forumPosts: 13, peerQuestions: 8, teamContributions: 5 }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#27ae60';
    if (score >= 80) return '#f39c12';
    return '#e74c3c';
  };

  const getGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const calculateClassAverage = () => {
    const total = mockStudents.reduce((sum, student) => sum + student.participationScore, 0);
    return Math.round(total / mockStudents.length);
  };

  const getTopPerformers = () => {
    return mockStudents
      .sort((a, b) => b.participationScore - a.participationScore)
      .slice(0, 3);
  };

  const getNeedsImprovement = () => {
    return mockStudents
      .sort((a, b) => a.participationScore - b.participationScore)
      .slice(0, 3);
  };

  return (
    <div className="analytics-container">
      <h2>Participation Analytics</h2>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Timeframe</label>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="semester">This Semester</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Metric</label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="participation">Participation Score</option>
            <option value="questions">Questions Answered</option>
            <option value="forum">Forum Posts</option>
            <option value="peer">Peer Questions</option>
          </select>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h4>Class Overview</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
                {calculateClassAverage()}%
              </div>
              <div style={{ color: '#7f8c8d' }}>Class Average</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
                {mockStudents.length}
              </div>
              <div style={{ color: '#7f8c8d' }}>Total Students</div>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h4>Participation Distribution</h4>
          <div className="chart-placeholder">
            📊 Interactive Chart
            <br />
            <small>(Bar chart showing score distribution)</small>
          </div>
        </div>

        <div className="analytics-card">
          <h4>Top Performers</h4>
          <div className="student-list">
            {getTopPerformers().map((student, index) => (
              <div key={student.id} className="student-item">
                <div>
                  <div className="student-name">
                    #{index + 1} {student.name}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                    {student.questionsAnswered} questions • {student.forumPosts} posts
                  </div>
                </div>
                <div 
                  className="student-score"
                  style={{ background: getScoreColor(student.participationScore) }}
                >
                  {student.participationScore}% ({getGrade(student.participationScore)})
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <h4>Needs Improvement</h4>
          <div className="student-list">
            {getNeedsImprovement().map((student, index) => (
              <div key={student.id} className="student-item">
                <div>
                  <div className="student-name">
                    {student.name}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                    {student.questionsAnswered} questions • {student.forumPosts} posts
                  </div>
                </div>
                <div 
                  className="student-score"
                  style={{ background: getScoreColor(student.participationScore) }}
                >
                  {student.participationScore}% ({getGrade(student.participationScore)})
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Detailed Student Performance</h3>
        <div style={{ 
          background: 'white', 
          border: '1px solid #e1e8ed', 
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr',
            background: '#f8f9fa',
            padding: '1rem',
            fontWeight: '600',
            color: '#2c3e50',
            borderBottom: '1px solid #e1e8ed'
          }}>
            <div>Student</div>
            <div>Score</div>
            <div>Questions</div>
            <div>Forum</div>
            <div>Peer Q</div>
            <div>Teams</div>
            <div>Grade</div>
          </div>
          {mockStudents.map(student => (
            <div 
              key={student.id}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr',
                padding: '1rem',
                borderBottom: '1px solid #f1f3f4',
                alignItems: 'center'
              }}
            >
              <div className="student-name">{student.name}</div>
              <div style={{ color: getScoreColor(student.participationScore), fontWeight: 'bold' }}>
                {student.participationScore}%
              </div>
              <div>{student.questionsAnswered}</div>
              <div>{student.forumPosts}</div>
              <div>{student.peerQuestions}</div>
              <div>{student.teamContributions}</div>
              <div style={{ 
                color: getScoreColor(student.participationScore), 
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>
                {getGrade(student.participationScore)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #e1e8ed'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>Export & Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            className="btn"
            style={{ background: '#27ae60' }}
            onClick={() => alert('Exporting participation data to CSV...')}
          >
            📊 Export to CSV
          </button>
          <button
            className="btn"
            style={{ background: '#3498db' }}
            onClick={() => alert('Generating detailed report...')}
          >
            📋 Generate Report
          </button>
          <button
            className="btn"
            style={{ background: '#f39c12' }}
            onClick={() => alert('Sending participation reminders...')}
          >
            📧 Send Reminders
          </button>
          <button
            className="btn"
            style={{ background: '#9b59b6' }}
            onClick={() => alert('Opening gradebook integration...')}
          >
            📚 Update Gradebook
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipationAnalytics;
