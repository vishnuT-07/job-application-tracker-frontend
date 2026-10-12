import React from 'react';
import { Briefcase, LayoutDashboard, Calendar, Plus, Server, CheckCircle2 } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  applicationCount = 0,
  interviewCount = 0,
  isBackendLive = null,
}) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-icon">
            <Briefcase size={22} color="#ffffff" />
          </div>
          <div className="brand-text">
            <h1>JobTracker</h1>
            <span className="brand-subtitle">Interview & Analytics</span>
          </div>
        </div>

        <nav className="navbar-nav">
          <button
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-link ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <Briefcase size={17} />
            <span>Applications</span>
            {applicationCount > 0 && <span className="nav-badge">{applicationCount}</span>}
          </button>

          <button
            className={`nav-link ${activeTab === 'interviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('interviews')}
          >
            <Calendar size={17} />
            <span>Interviews</span>
            {interviewCount > 0 && <span className="nav-badge">{interviewCount}</span>}
          </button>
        </nav>

        <div className="navbar-actions">
          {isBackendLive === true ? (
            <span className="backend-status-pill live" title="Connected to Spring Boot & PostgreSQL">
              <span className="status-dot-pulse"></span>
              <span>Backend Live</span>
            </span>
          ) : (
            <span className="backend-status-pill demo" title="Backend not running; showing interactive preview data">
              <span className="status-dot-pulse"></span>
              <span>Demo Mode</span>
            </span>
          )}

          <button className="btn btn-primary" onClick={onOpenAddModal}>
            <Plus size={16} />
            <span>Add Application</span>
          </button>
        </div>
      </div>
    </header>
  );
}
