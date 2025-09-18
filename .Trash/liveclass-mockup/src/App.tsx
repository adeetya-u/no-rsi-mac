import React, { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import QuestionCreator from './components/QuestionCreator';
import Forum from './components/Forum';
import TeamManagement from './components/TeamManagement';
import ParticipationAnalytics from './components/ParticipationAnalytics';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [userRole, setUserRole] = useState('student'); // 'student' or 'professor'

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard userRole={userRole} onNavigate={setCurrentView} />;
      case 'questions':
        return <QuestionCreator userRole={userRole} onNavigate={setCurrentView} />;
      case 'forum':
        return <Forum userRole={userRole} onNavigate={setCurrentView} />;
      case 'teams':
        return <TeamManagement userRole={userRole} onNavigate={setCurrentView} />;
      case 'analytics':
        return <ParticipationAnalytics userRole={userRole} onNavigate={setCurrentView} />;
      default:
        return <Dashboard userRole={userRole} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>LiveClass - CS 411 Database Systems</h1>
          <div className="user-controls">
            <select 
              value={userRole} 
              onChange={(e) => setUserRole(e.target.value)}
              className="role-selector"
            >
              <option value="student">Student View</option>
              <option value="professor">Professor View</option>
            </select>
          </div>
        </div>
        <nav className="main-nav">
          <button 
            className={currentView === 'dashboard' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setCurrentView('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={currentView === 'forum' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setCurrentView('forum')}
          >
            Forum
          </button>
          <button 
            className={currentView === 'questions' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setCurrentView('questions')}
          >
            Questions
          </button>
          <button 
            className={currentView === 'teams' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setCurrentView('teams')}
          >
            Teams
          </button>
          {userRole === 'professor' && (
            <button 
              className={currentView === 'analytics' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setCurrentView('analytics')}
            >
              Analytics
            </button>
          )}
        </nav>
      </header>
      <main className="app-main">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;