import React, { useState } from 'react';

interface TeamManagementProps {
  userRole: string;
  onNavigate: (view: string) => void;
}

interface Team {
  id: number;
  name: string;
  members: string[];
  project: string;
  maxMembers: number;
  isJoined: boolean;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ userRole, onNavigate }) => {
  const [teams, setTeams] = useState<Team[]>([
    {
      id: 1,
      name: "Team Alpha",
      members: ["Sarah Chen", "Mike Johnson", "Alex Kim", "Emma Davis"],
      project: "Database Design for E-commerce Platform",
      maxMembers: 4,
      isJoined: false
    },
    {
      id: 2,
      name: "Team Beta",
      members: ["David Wilson", "Lisa Zhang"],
      project: "Query Optimization and Performance Analysis",
      maxMembers: 4,
      isJoined: true
    },
    {
      id: 3,
      name: "Team Gamma",
      members: ["John Smith", "Maria Garcia", "Tom Brown", "Anna Lee", "Chris Taylor"],
      project: "Data Modeling for Healthcare System",
      maxMembers: 5,
      isJoined: false
    },
    {
      id: 4,
      name: "Team Delta",
      members: ["Rachel Green"],
      project: "NoSQL Database Implementation",
      maxMembers: 3,
      isJoined: false
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamProject, setNewTeamProject] = useState('');
  const [newTeamMaxMembers, setNewTeamMaxMembers] = useState(4);

  const handleJoinTeam = (teamId: number) => {
    setTeams(teams.map(team => 
      team.id === teamId 
        ? { ...team, members: [...team.members, "You"], isJoined: true }
        : team
    ));
  };

  const handleLeaveTeam = (teamId: number) => {
    setTeams(teams.map(team => 
      team.id === teamId 
        ? { 
            ...team, 
            members: team.members.filter(member => member !== "You"), 
            isJoined: false 
          }
        : team
    ));
  };

  const handleCreateTeam = () => {
    if (newTeamName && newTeamProject) {
      const newTeam: Team = {
        id: Date.now(),
        name: newTeamName,
        members: ["You"],
        project: newTeamProject,
        maxMembers: newTeamMaxMembers,
        isJoined: true
      };
      setTeams([newTeam, ...teams]);
      setNewTeamName('');
      setNewTeamProject('');
      setNewTeamMaxMembers(4);
      setShowCreateForm(false);
    }
  };

  const getTeamStatus = (team: Team) => {
    if (team.isJoined) return 'joined';
    if (team.members.length >= team.maxMembers) return 'full';
    return 'available';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'joined': return '#27ae60';
      case 'full': return '#e74c3c';
      default: return '#3498db';
    }
  };

  return (
    <div className="teams-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Team Management</h2>
        <button
          className="create-team-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create New Team'}
        </button>
      </div>

      {showCreateForm && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          border: '1px solid #e1e8ed'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>Create New Team</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Team Name
              </label>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter team name"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Project Description
              </label>
              <textarea
                value={newTeamProject}
                onChange={(e) => setNewTeamProject(e.target.value)}
                placeholder="Describe your team's project"
                rows={3}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Maximum Members
              </label>
              <input
                type="number"
                value={newTeamMaxMembers}
                onChange={(e) => setNewTeamMaxMembers(Number(e.target.value))}
                min="2"
                max="6"
                style={{ width: '100px', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <button
                className="btn"
                onClick={handleCreateTeam}
                style={{ background: '#27ae60' }}
              >
                Create Team
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="teams-grid">
        {teams.map(team => {
          const status = getTeamStatus(team);
          return (
            <div key={team.id} className="team-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: '#2c3e50' }}>{team.name}</h4>
                <span style={{ 
                  background: getStatusColor(status), 
                  color: 'white', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase'
                }}>
                  {status}
                </span>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <strong>Project:</strong>
                <p style={{ margin: '0.5rem 0', color: '#34495e' }}>{team.project}</p>
              </div>

              <div className="team-members">
                <strong>Members ({team.members.length}/{team.maxMembers}):</strong>
                {team.members.map((member, index) => (
                  <div key={index} className="team-member">
                    <span style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      background: '#3498db', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      {member.charAt(0)}
                    </span>
                    <span>{member}</span>
                  </div>
                ))}
              </div>

              <div className="team-actions">
                {status === 'joined' ? (
                  <button
                    className="team-btn leave-btn"
                    onClick={() => handleLeaveTeam(team.id)}
                  >
                    Leave Team
                  </button>
                ) : status === 'available' ? (
                  <button
                    className="team-btn join-btn"
                    onClick={() => handleJoinTeam(team.id)}
                  >
                    Join Team
                  </button>
                ) : (
                  <button
                    className="team-btn"
                    disabled
                    style={{ background: '#95a5a6', cursor: 'not-allowed' }}
                  >
                    Team Full
                  </button>
                )}
                
                <button
                  className="team-btn"
                  style={{ background: '#9b59b6', color: 'white' }}
                  onClick={() => alert('Team chat and collaboration features coming soon!')}
                >
                  Collaborate
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {userRole === 'professor' && (
        <div style={{ 
          marginTop: '2rem', 
          padding: '1.5rem', 
          background: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #e1e8ed'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>Professor Tools</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn"
              style={{ background: '#3498db' }}
              onClick={() => alert('Team analytics and performance tracking coming soon!')}
            >
              View Team Analytics
            </button>
            <button
              className="btn"
              style={{ background: '#f39c12' }}
              onClick={() => alert('Team assignment and management tools coming soon!')}
            >
              Manage Teams
            </button>
            <button
              className="btn"
              style={{ background: '#e74c3c' }}
              onClick={() => alert('Team evaluation and grading tools coming soon!')}
            >
              Grade Team Projects
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
